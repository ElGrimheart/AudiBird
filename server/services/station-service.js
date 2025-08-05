import db from "../config/db-conn.js";

export async function getStationById(stationId) {
    const sql = `
        SELECT *
        FROM station
        WHERE station_id = $1
        LIMIT 1
    `;

    const result = await db.query(sql, [stationId]);
    return result.rows[0] || null;
}

export async function getStationConfigById(stationId) {
    const sql = `
        SELECT user_config
        FROM station
        WHERE station_id = $1
        LIMIT 1
    `;

    const result = await db.query(sql, [stationId]);
    return result.rows[0] || null;
}

// Retrieves metadata for a station including date range of detections and species list
export async function getStationMetadataById(stationId) {
    const sql = `
        SELECT 
            user_config, 
            MIN(detection_timestamp) AS first_detection, 
            MAX(detection_timestamp) AS last_detection,
            (SELECT ARRAY_AGG(common_name ORDER BY common_name ASC)
                FROM (
                    SELECT DISTINCT common_name
                    FROM detection
                    WHERE station_id = $1
                ) AS species
            ) AS species_list
        FROM station
        JOIN detection ON station.station_id = detection.station_id
        WHERE station.station_id = $1
        GROUP BY user_config
        LIMIT 1
    `;

    const result = await db.query(sql, [stationId]);
    
    return result.rows[0] || null;
}

export async function getStationStatusById(stationId) {
    // SQL query to retrieve the most recent station status from the database
    return null;
}

export async function createStationStatusById(stationId, statusData) {
    // SQL query to update station status in the database
    return null;
}