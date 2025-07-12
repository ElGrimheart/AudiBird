import db from "../config/db-conn.js";
import { buildDetectionWhereClause, buildDetectionSortClause } from "../utils/sqlBuilder.js";

// Retrieves a detection by its ID
export async function getDetectionById(stationId, detectionId) {
    const sql = `
        SELECT *
        FROM detection
        WHERE station_id = $1 AND detection_id = $2
        LIMIT 1
    `;

    const result = await db.query(sql, [stationId, detectionId]);
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
        JOIN audio ON detection.detection_id = audio.detection_id
        WHERE station_id=$1 
        ORDER BY detection_timestamp DESC 
        LIMIT 10`;

    const result = await db.query(sql, [stationId]);
    return result.rows;
}

// Retrieves the 5 most common species detected for a given station ID
export async function getMostCommonSpeciesByStationId(stationId) {
    const sql = 
        `SELECT common_name, COUNT(*) as count
        FROM detection
        WHERE station_id=$1
        GROUP BY common_name
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
        total_detections: parseInt(totalDetectionsResult.rows[0].count),
        total_species: parseInt(totalSpeciesResult.rows[0].count),
        detections_today: parseInt(detectionsTodayResult.rows[0].count),
        species_today: parseInt(speciesTodayResult.rows[0].count),
        detections_last_hour: parseInt(detectionsLastHourResult.rows[0].count),
        species_last_hour: parseInt(speciesLastHourResult.rows[0].count),
    };
}

// Retrieves filtered detections for a given station ID
export async function getFilteredDetectionsByStationId(stationId, { from, to, species, min_confidence, max_confidence, limit, offset, sort, sort_by }) {
    // Build the WHERE clause based on filters
    const { whereClause, values } = buildDetectionWhereClause(stationId, {from, to, species, min_confidence, max_confidence});

    // Build the ORDER BY clause based on sort parameters
    const orderByClause = buildDetectionSortClause(sort_by, sort);

    // Pagination
    const lim = Math.max(parseInt(limit) || 50, 1);
    const off = Math.max(parseInt(offset) || 0, 0);

    const sql = `
        SELECT *
        FROM detection
        JOIN audio ON detection.detection_id = audio.detection_id
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

    const detectionSql = `
        INSERT INTO detection (common_name, scientific_name, confidence, detection_timestamp, station_metadata, audio_metadata, processing_metadata, station_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

    const detectionValues = [
        detectionData.common_name,
        detectionData.scientific_name,
        detectionData.confidence,
        detectionData.detection_timestamp || new Date(),
        detectionData.station_metadata,
        detectionData.audio_metadata,
        detectionData.processing_metadata,
        stationId
    ];

    const audioSql = `
        INSERT INTO audio (file_path, detection_id)
        VALUES ($1, $2)
    `;

    try {
        await db.query('BEGIN');

        const response = await db.query(detectionSql, detectionValues);
        const newDetectionId = response.rows[0];

        await db.query(audioSql, [
            detectionData.audio_path,
            newDetectionId.detection_id
        ]);

        await db.query('COMMIT');
        return newDetectionId;

    } catch (err) {
        await db.query('ROLLBACK');
        console.error("Error creating detection:", err);
        throw err;
    } 
}