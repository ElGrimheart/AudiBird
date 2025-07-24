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

export async function getUsersStations(userId) {
    const sql = `
        SELECT *
        FROM station
        INNER JOIN user_station ON station.station_id = user_station.station_id
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;

    const result = await db.query(sql, [userId]);
    return result.rows;
}

export async function getStationConfigById(stationId) {
    // SQL query to retrieve station configuration from the database
    
    return null;
}

export async function getStationStatusById(stationId) {
    // SQL query to retrieve the most recent station status from the database
    
    return null;
}

export async function createStationStatusById(stationId, statusData) {
    // SQL query to update station status in the database
    
    return null;
}