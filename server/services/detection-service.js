import db from "../config/db-conn.js";
import * as userService from "../services/user-service.js";
import { buildDetectionWhereClause, buildDetectionSortClause } from "../utils/sql-builder.js";
import { getMediaBySpeciesCode, postSpeciesMedia } from "./media-service.js";
import { scrapeImgUrl, scrapeAudioUrl } from "../utils/media-scraper.js";
import { VERIFICATION_STATUS_ID, NOTIFICATION_EVENT_TYPE_ID, NOTIFICATION_CHANNEL_TYPE_ID} from '../constants/database-type-id.js';
import { io } from "../server.js";
import { newDetectionQueue } from "../queues/new-detection-queue.js";

// Retrieves a detection by its ID
export async function getDetectionById(detectionId) {
    const sql = `
        SELECT *
        FROM detection
        WHERE detection_id = $1
        LIMIT 1
    `;

    const result = await db.query(sql, [detectionId]);
    return result.rows[0] || null;
}

// Retrieves all detections for the passed station ID
export async function getAllDetectionsByStationId(stationId) {
    const sql = `
        SELECT *
        FROM detection
        WHERE station_id = $1
    `;

    const result = await db.query(sql, [stationId]);
    return result.rows;
}

// Retrieves the most recent 10 detections for a given station ID
export async function getRecentDetectionsByStationId(stationId, { limit }) {
    const sql = 
        `SELECT * 
        FROM detection
        LEFT OUTER JOIN audio ON detection.audio_id = audio.audio_id
        LEFT OUTER JOIN species_media ON detection.species_code = species_media.species_code
        WHERE station_id=$1 
        ORDER BY detection_timestamp DESC 
        LIMIT $2`;

    const result = await db.query(sql, [stationId, limit]);
    return result.rows;
}

// Retrieves filtered detections for a given station ID
export async function getFilteredDetectionsByStationId(stationId, { startDate, endDate, speciesName, minConfidence, maxConfidence, verificationStatusId, protectedAudio, limit, offset, sortOrder, sortBy }) {
    
    // Build the WHERE clause 
    const { whereClause, values } = buildDetectionWhereClause(stationId, { startDate, endDate, speciesName, minConfidence, maxConfidence, verificationStatusId, protectedAudio });

    // Build the ORDER BY clause 
    const orderByClause = buildDetectionSortClause(sortBy, sortOrder);

    // Pagination
    const lim = Math.max(parseInt(limit) || 15, 1);
    const off = Math.max(parseInt(offset) || 0, 0);

    // Main query for paginated results
    const filterSql = `
        SELECT *
        FROM detection
        LEFT OUTER JOIN audio ON detection.audio_id = audio.audio_id
        LEFT OUTER JOIN species_media ON detection.species_code = species_media.species_code
        ${whereClause}
        ${orderByClause}
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
    `;
    const paginatedValues = [...values, lim, off];

    // Count query for total results
    const countSql = `
        SELECT COUNT(*) AS total
        FROM detection
        LEFT OUTER JOIN audio ON detection.audio_id = audio.audio_id
        LEFT OUTER JOIN species_media ON detection.species_code = species_media.species_code
        ${whereClause}
    `;

    // Execute the filter and count queries
    const filterResult = await db.query(filterSql, paginatedValues);
    const countResult = await db.query(countSql, values);

    return {
        rows: filterResult.rows,
        totalResults: parseInt(countResult.rows[0].total, 15)
    };
}

// Retrieves alternative species for a given detection ID
export async function getAlternativeSpeciesByDetectionId(detectionId) {
    const sql = `
        SELECT *
        FROM alternative_predictions
        LEFT JOIN species_media ON alternative_predictions.species_code = species_media.species_code
        WHERE detection_id = $1
    `;

    const result = await db.query(sql, [detectionId]);
    return result.rows;
}


// Creates a new detection record in the database
export async function createDetection(stationId, detectionData) {
    const audioSql = `
        INSERT INTO audio (file_name, duration_seconds, file_size)
        VALUES ($1, $2, $3)
        RETURNING audio_id
    `;

    const newDetectionSql = `
        INSERT INTO detection (
            common_name, 
            scientific_name, 
            confidence, 
            detection_timestamp, 
            station_metadata, 
            audio_metadata, 
            processing_metadata, 
            station_id, 
            species_code, 
            audio_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;

    const speciesCodeSql = `
        SELECT species_code
        FROM taxonomy
        WHERE LOWER(common_name) = LOWER($1) OR LOWER(scientific_name) = LOWER($2)
        LIMIT 1
    `;

    try {
        await db.query('BEGIN');

        // Insert audio file and get its ID
        const audioResult = await db.query(audioSql, [detectionData.recording_file_name, detectionData.audio_metadata.duration, detectionData.audio_metadata.filesize]);
        const audioId = audioResult.rows[0].audio_id;

        // Get species code for main detection from taxonomy table
        const speciesCodeResult = await db.query(speciesCodeSql, [detectionData.common_name, detectionData.scientific_name]);
        const speciesCode = speciesCodeResult.rows[0]?.species_code || null;

        // Contruct the detection record
        const detectionValues = [
            detectionData.common_name,
            detectionData.scientific_name,
            detectionData.confidence,
            detectionData.detection_timestamp || new Date(),
            detectionData.station_metadata || {},
            detectionData.audio_metadata || {},
            detectionData.processing_metadata || {},
            stationId,
            speciesCode || null, 
            audioId,
        ];

        // Insert the detection record
        const createDetectionResult = await db.query(newDetectionSql, detectionValues);
        const newDetection = createDetectionResult.rows[0];

        // Create alternative species records
        await processAlternativeSpecies(newDetection.detection_id, detectionData.alternative_species);

        await db.query('COMMIT');

        // Add the new detection to the user alert queues
        await alertUsers(newDetection);

        return newDetection;
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
}

// Updates a detection's verification status to verified
export async function verifyDetection(detectionId) {
    const sql = `
        UPDATE detection
        SET verification_status_id = $1
        WHERE detection_id = $2
        RETURNING *
    `;

    const values = [VERIFICATION_STATUS_ID.Verified, detectionId];

    const result = await db.query(sql, values);
    return result.rows[0];
}


// Reclassifies a detection using an alternative species prediction
export async function reclassifyDetection(detectionId, alternativePredictionId) {

    const altSpeciesSql = `
        SELECT *
        FROM alternative_predictions
        WHERE alternative_prediction_id = $1
        LIMIT 1
    `;

    const newAltSpeciesSql = `
        INSERT INTO alternative_predictions (
            detection_id,
            common_name,
            scientific_name,
            confidence,
            species_code
        ) VALUES ($1, $2, $3, $4, $5)
    `;

    const updateDetectionSql = `
        UPDATE detection
        SET 
            common_name = $1,
            scientific_name = $2,
            confidence = $3,
            species_code = $4,
            verification_status_id = $5
        WHERE detection_id = $6
    `;

     const deleteAltSpeciesSql = `
        DELETE FROM alternative_predictions
        WHERE alternative_prediction_id = $1
    `;

    try {
        await db.query('BEGIN');

        // Fetch current detection and selected alternative
        const originalDetection = await getDetectionById(detectionId);
        const altResult = await db.query(altSpeciesSql, [alternativePredictionId]);
        const altSpecies = altResult.rows[0];

        if (!originalDetection || !altSpecies) throw new Error("Detection or alternative not found");

        // Log original detection as new alternative
        await db.query(newAltSpeciesSql, [
            detectionId,
            originalDetection.common_name,
            originalDetection.scientific_name,
            originalDetection.confidence,
            originalDetection.species_code
        ]);

        // Update detection with alternative species details
        await db.query(updateDetectionSql, [
            altSpecies.common_name,
            altSpecies.scientific_name,
            altSpecies.confidence,
            altSpecies.species_code,
            VERIFICATION_STATUS_ID.Reclassified,
            detectionId
        ]);

        // Delete the selected alternative prediction
        await db.query(deleteAltSpeciesSql, [alternativePredictionId]);

        await db.query('COMMIT');
        return true;
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
}

// Deletes a detection record (including associated audio record if exists) and return the audio file name
export async function deleteDetection(detectionId) {
    if (await canDeleteAudio(detectionId)) {
        throw new Error("Audio protected");
    }

    const getDetectionSql = `
        SELECT detection.*, audio.audio_id, audio.file_name
        FROM detection
        LEFT JOIN audio ON audio.audio_id = detection.audio_id
        WHERE detection_id = $1
        LIMIT 1
    `;

    const deleteAudioSql = `
        DELETE FROM audio
        WHERE audio_id = $1
        RETURNING *
    `;

    const deleteDetectionSql = `
        DELETE FROM detection
        WHERE detection_id = $1
        RETURNING *
    `;

    try {
        await db.query('BEGIN');

        const detectionRecord = await db.query(getDetectionSql, [detectionId]);
        const audioId = detectionRecord.rows[0]?.audio_id;
        const audioFileName = detectionRecord.rows[0]?.file_name;

        // Delete the audio file if it exists
        if (audioId) {
            await db.query(deleteAudioSql, [audioId]);
        }

        const detectionResult = await db.query(deleteDetectionSql, [detectionId]);
        await db.query('COMMIT');

        return {
            deletedDetection: detectionResult.rows[0],
            deletedAudioFileName: audioFileName
        };
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
}



// Helper functions for creating, modifying, and deleting detections  ///////

// Checks for existing media links for a species, otherwise scrapes new media if required
async function scrapeSpeciesMedia(speciesCode) {
    if (!speciesCode) {
        return;
    }

    // check if media links already cached in database
    let mediaLinks = await getMediaBySpeciesCode(speciesCode);

    // otherwise scrape new media
    if (!mediaLinks || !mediaLinks.image_url || !mediaLinks.audio_url) {
        console.log(`missing media links for species code ${speciesCode}, scraping...`);
        const { imageUrl, imageRights } = await scrapeImgUrl(speciesCode);
        const { audioUrl, audioRights } = await scrapeAudioUrl(speciesCode);
        if (imageUrl || audioUrl) {
            console.log(`scraped image URL: ${imageUrl}, audio URL: ${audioUrl} for species code ${speciesCode}`);
            await postSpeciesMedia(speciesCode, imageUrl, imageRights, audioUrl, audioRights);
        }
        
    }
}


// Processes alternative species by looking up their species codes and scraping media if needed
async function processAlternativeSpecies(detectionId, alternativeSpecies) {
    if (!Array.isArray(alternativeSpecies)) {
        return [];
    }

    const speciesCodeSql = `
        SELECT species_code
        FROM taxonomy
        WHERE LOWER(common_name) = LOWER($1) OR LOWER(scientific_name) = LOWER($2)
        LIMIT 1
    `;

    const altSpeciesSql = `
        INSERT INTO alternative_predictions (
            detection_id,
            common_name,
            scientific_name,
            confidence,
            species_code
        ) VALUES ($1, $2, $3, $4, $5)
    `;


    for (const species of alternativeSpecies) {
        // Lookup species code for each alternative
        const speciesCode = await db.query(speciesCodeSql, [species.common_name, species.scientific_name]);
        const altSpeciesCode = speciesCode.rows[0]?.species_code || null;

        // Scrape media if needed
        await scrapeSpeciesMedia(altSpeciesCode);

        // Insert into alternative_predictions table
        await db.query(altSpeciesSql, [
            detectionId,
            species.common_name,
            species.scientific_name,
            species.confidence,
            altSpeciesCode
        ]);
    }
}

// Alerts users to new detections - including socket and email notifications
async function alertUsers(newDetection) {

    // Get email of subscribers tracking new detections for station
    const users = await userService.getUsersByPreferences(
        newDetection.station_id, 
        NOTIFICATION_EVENT_TYPE_ID.NewDetection, 
        NOTIFICATION_CHANNEL_TYPE_ID.Email, 
        { confidence: newDetection.confidence }
    );

    // Add subscribers to the newDetectionQueue
    for (const user of users) {
        await newDetectionQueue.add({
            userEmail: user.email,
            newDetection: {
                ...newDetection,
                station_name: user.station_name
            }
        });
        console.log(`Job added for ${user.email}`);
    }

    // Emit socket event to station room
    io.to(newDetection.station_id).emit("newDetection", newDetection);
}

// Checks if the audio recording for a detection is protected
async function canDeleteAudio(detectionId) {
    const sql = `
        SELECT audio.protected 
        FROM detection
        LEFT JOIN audio ON audio.audio_id = detection.audio_id
        WHERE detection_id = $1
    `;

    const result = await db.query(sql, [detectionId]);
    console.log(`Checking if audio is protected for detection ID ${detectionId}:`, result.rows[0]?.protected);  
    return result.rows[0]?.protected;
}