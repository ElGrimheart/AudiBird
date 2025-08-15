import db from "../config/db-conn.js";
import { getMediaBySpeciesCode, postSpeciesMedia } from "./media-service.js";
import { scrapeImgUrl, scrapeAudioUrl } from "../utils/media-scraper.js";
import { buildDetectionWhereClause, buildDetectionSortClause } from "../utils/sql-builder.js";
import { handleNewDetection } from "../handlers/detection-handler.js";
import logAction from "../utils/logger.js";

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
export async function getFilteredDetectionsByStationId(stationId, { startDate, endDate, speciesName, minConfidence, maxConfidence, limit, offset, sortOrder, sortBy }) {
    // Build the WHERE clause based on filters
    const { whereClause, values } = buildDetectionWhereClause(stationId, { startDate, endDate, speciesName, minConfidence, maxConfidence });

    // Build the ORDER BY clause based on sort parameters
    const orderByClause = buildDetectionSortClause(sortBy, sortOrder);

    // Pagination
    const lim = Math.max(parseInt(limit) || 50, 1);
    const off = Math.max(parseInt(offset) || 0, 0);

    const sql = `
        SELECT *
        FROM detection
        LEFT OUTER JOIN audio ON detection.audio_id = audio.audio_id
        LEFT OUTER JOIN species_media ON detection.species_code = species_media.species_code
        ${whereClause}
        ${orderByClause}
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
    `;
    values.push(lim, off);

    const result = await db.query(sql, values);
    return result.rows;
}


// Creates a new detection record in the database
export async function createDetection(stationId, detectionData) {
    const audioSql = `
        INSERT INTO audio (file_name)
        VALUES ($1)
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
        const audioResult = await db.query(audioSql, [detectionData.recording_file_name]);
        const audioId = audioResult.rows[0].audio_id;

        // Get species code from taxonomy table
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
            audioId
        ];

        // Insert the detection record and commit the transaction
        const createDetectionResult = await db.query(newDetectionSql, detectionValues);
        const newDetection = createDetectionResult.rows[0];
        await db.query('COMMIT');

        // Add the new detection to the queue for further processing
        handleNewDetection(newDetection)

        // Check for database for existing cached media links or attempt to scrape if not found
        let mediaLinks = await getMediaBySpeciesCode(speciesCode);

        if (!mediaLinks || !mediaLinks.image_url || !mediaLinks.audio_url) {
            console.log(`missing media links for species code ${speciesCode}, scraping...`);
            const { imageUrl, imageRights } = await scrapeImgUrl(speciesCode);
            const { audioUrl, audioRights } = await scrapeAudioUrl(speciesCode);

            console.log(`scraped image URL: ${imageUrl}, audio URL: ${audioUrl}`);
            if (imageUrl || audioUrl) {
                mediaLinks = await postSpeciesMedia(speciesCode, imageUrl, imageRights, audioUrl, audioRights);
            }
        }

        return newDetection;
    } catch (error) {
        await db.query('ROLLBACK');
        logAction("Error creating detection", { error });
    }
}