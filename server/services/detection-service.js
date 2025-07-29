import db from "../config/db-conn.js";
import { getSpeciesCodeByName } from "./species-service.js";
import { getMediaBySpeciesCode, postMedia } from "./media-service.js";
import { scrapeImgUrl, scrapeAudioUrl } from "../utils/mediaScraper.js";
import { buildDetectionWhereClause, buildDetectionSortClause } from "../utils/sqlBuilder.js";

// Retrieves a detection by its ID
export async function getDetectionById(detectionId) {
    const sql = `
        SELECT *
        FROM detection
        LEFT JOIN
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
export async function getRecentDetectionsByStationId(stationId) {
    const sql = 
        `SELECT * 
        FROM detection
        LEFT OUTER JOIN audio ON detection.audio_id = audio.audio_id
        LEFT JOIN species_media ON detection.species_code = species_media.species_code
        WHERE station_id=$1 
        ORDER BY detection_timestamp DESC 
        LIMIT 10`;

    const result = await db.query(sql, [stationId]);
    return result.rows;
}

// Retrieves the 5 most common species detected for a given station ID
export async function getMostCommonSpeciesByStationId(stationId) {
    const sql = 
        `SELECT detection.common_name, detection.scientific_name, detection.species_code, species_media.image_url, species_media.image_rights, COUNT(*) as count
        FROM detection
        LEFT JOIN species_media ON detection.species_code = species_media.species_code
        WHERE detection.station_id = $1
        GROUP BY detection.common_name, detection.scientific_name, detection.species_code, species_media.image_url, species_media.image_rights
        ORDER BY count DESC
        LIMIT 5`;

    const result = await db.query(sql, [stationId]);
    return result.rows;
}

// Retrieves a summary of detections for a given station ID
// Includes total detections, total species, detections today, species today, detections last hour, species last hour
export async function getDetectionSummaryByStationId(stationId, filters) {
    const { from, to, species } = filters || {};
    
    // Build the WHERE clause based on filters
    const { whereClause, values } = buildDetectionWhereClause(stationId, { from, to, species });

    // Compile the summary statistics
    const totalDetectionsResult = await db.query(
        `SELECT COUNT(*) FROM detection ${whereClause}`, values
    );

    const totalSpeciesResult = await db.query(
        `SELECT COUNT(DISTINCT common_name) FROM detection ${whereClause}`, values
    );

    const detectionsTodayResult = await db.query(
        `SELECT COUNT(*) FROM detection ${whereClause} AND detection_timestamp >= CURRENT_DATE`, values
    );

    const speciesTodayResult = await db.query(
        `SELECT COUNT(DISTINCT common_name) FROM detection ${whereClause} AND detection_timestamp >= CURRENT_DATE`, values
    );

    const detectionsLastHourResult = await db.query(
        `SELECT COUNT(*) FROM detection ${whereClause} AND detection_timestamp >= NOW() - INTERVAL '1 hour'`, values
    );

    const speciesLastHourResult = await db.query(
        `SELECT COUNT(DISTINCT common_name) FROM detection ${whereClause} AND detection_timestamp >= NOW() - INTERVAL '1 hour'`, values
    );

    return {
        "total detections": parseInt(totalDetectionsResult.rows[0].count),
        "total species": parseInt(totalSpeciesResult.rows[0].count),
        "detections today": parseInt(detectionsTodayResult.rows[0].count),
        "species today": parseInt(speciesTodayResult.rows[0].count),
        "detections last hour": parseInt(detectionsLastHourResult.rows[0].count),
        "species last hour": parseInt(speciesLastHourResult.rows[0].count),
    };
}

// Retrieves filtered detections for a given station ID
export async function getFilteredDetectionsByStationId(stationId, { from, to, species, minConfidence, maxConfidence, limit, offset, sortOrder, sortBy }) {
    // Build the WHERE clause based on filters
    const { whereClause, values } = buildDetectionWhereClause(stationId, {from, to, species, minConfidence, maxConfidence});

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


// Creates a new detection in the database
export async function createDetection(stationId, detectionData) {

    const audioSql = `
        INSERT INTO audio (file_name)
        VALUES ($1)
        RETURNING audio_id
    `;

    const detectionSql = `
        INSERT INTO detection (common_name, scientific_name, confidence, detection_timestamp, station_metadata, audio_metadata, processing_metadata, station_id, species_code, audio_id)
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
        const audioResponse = await db.query(audioSql, [
            detectionData.recording_file_name
        ]);
        const audioId = audioResponse.rows[0].audio_id;

        // Get species code from taxonomy table
        const speciesCode = await getSpeciesCodeByName(detectionData.common_name, detectionData.scientific_name);
        
        // Check for cached media links for species in the database
        let mediaLinks = await getMediaBySpeciesCode(speciesCode);

        // If no media links found, scrape eBird for media and insert into media table
        if (!mediaLinks || !mediaLinks.image_url || !mediaLinks.audio_url) {
            console.log(`Missing media links for species code: ${speciesCode}. Scraping eBird for media...`);
            const { imageUrl, imageRights } = await scrapeImgUrl(speciesCode);
            const { audioUrl, audioRights } = await scrapeAudioUrl(speciesCode);

            console.log(`Scraped image URL: ${imageUrl} with rights: ${imageRights}`);
            console.log(`Scraped audio URL: ${audioUrl} with rights: ${audioRights}`);

            if (imageUrl) {
                mediaLinks = await postMedia(speciesCode, imageUrl, imageRights, audioUrl, audioRights);
            }
        }

        // Insert detection data
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

        const detectionResponse = await db.query(detectionSql, detectionValues);
        const newDetection = detectionResponse.rows[0];

        await db.query('COMMIT');
        return newDetection;

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error creating detection:", error);
        throw error;
    }
}