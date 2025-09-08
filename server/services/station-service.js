import db from "../config/db-conn.js";
import axios from "axios";
import { generateCustomUserConfig, generateDefaultStationConfig } from "../utils/station-config-generator.js";
import { STATION_USER_TYPE_ID, NOTIFICATION_EVENT_TYPE_ID, NOTIFICATION_CHANNEL_TYPE_ID } from "../constants/database-type-id.js";

// Retrieves a station's data by its ID
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

// Retrieves the configuration for a station by its ID
export async function getStationConfigById(stationId) {
    const sql = `
        SELECT station_config
        FROM station
        WHERE station_id = $1
        LIMIT 1
    `;

    const result = await db.query(sql, [stationId]);
    return result.rows[0] || null;
}


// Retrieves the latest status of a station by its ID and returns its online/offline status
export async function getStationStatusById(stationId) {
    const sql = `
        SELECT
            station.station_name,
            station_status.cpu_temp,
            station_status.memory_usage_percent,
            station_status.disk_usage_percent,
            station_status.battery_level_percent,
            station_status.is_recording,
            station_status.created_at
        FROM station_status
        JOIN station ON station.station_id = station_status.station_id
        WHERE station_status.station_id = $1
        ORDER BY created_at DESC
        LIMIT 1
    `;

    const result = await db.query(sql, [stationId]);
    
    if (!result.rows.length) {
        return null; // No status found for this station
    }

    const latestStatus = result.rows[0];

    // Calculate minutes since last seen
    const minutesSinceLastSeen = (Date.now() - new Date(latestStatus.created_at)) / 60000;

    return { ...latestStatus, status: minutesSinceLastSeen > 2 ? "offline" : "online" };  // calculate online/offline status
}

// Retrieves metadata for a station including date range of detections and species list
export async function getStationMetadataById(stationId) {
    const sql = `
        SELECT 
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
        GROUP BY station_config
        LIMIT 1
    `;

    const result = await db.query(sql, [stationId]);
    
    return result.rows[0] || null;
}


// Creates a new station record in the database
export async function createStation(stationName, stationHost, stationPort) {
    const sql = `
        INSERT INTO station (station_name, station_host, station_port)
        VALUES ($1, $2, $3)
        RETURNING station_name, station_id, api_key
    `
    const values = [stationName, stationHost, stationPort];

    const newStation = await db.query(sql, values);

    return newStation.rows[0];
}


// Registers a new station - including setting default station config and user notification preferences
export async function registerStationToUser(userId, stationId, apiKey) {
    const storedStation = await canRegisterStation(stationId, userId, apiKey);

    if (storedStation) {

        const newConfig = generateDefaultStationConfig(storedStation.station_name, stationId, apiKey);

        const userStationSql = `
            INSERT INTO user_station (user_id, station_id, station_user_type_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const stationConfigSql = `
            UPDATE station
            SET station_config = $1
            WHERE station_id = $2
            RETURNING *
        `;

        const userPreferencesSql = `
            INSERT INTO user_preferences (enabled, threshold, user_id, event_type_id, channel_type_id, station_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const userStationValue = [ userId, stationId, STATION_USER_TYPE_ID.Owner ];
        const stationConfigValue = [ newConfig, stationId ];

        const userDailySummaryValues = [true, null, userId, NOTIFICATION_EVENT_TYPE_ID.DailySummary, NOTIFICATION_CHANNEL_TYPE_ID.Email, stationId];
        const userNewDetectionEmailValues = [true, 0, userId, NOTIFICATION_EVENT_TYPE_ID.NewDetection, NOTIFICATION_CHANNEL_TYPE_ID.Email, stationId];
        const userNewDetectionToastValues = [true, 0, userId, NOTIFICATION_EVENT_TYPE_ID.NewDetection, NOTIFICATION_CHANNEL_TYPE_ID.Toast, stationId];
        const userLowStorageEmailValues = [true, 0.8, userId, NOTIFICATION_EVENT_TYPE_ID.LowStorage, NOTIFICATION_CHANNEL_TYPE_ID.Email, stationId];
        

        try {
            await db.query('BEGIN');
            
            const result = await db.query(userStationSql, userStationValue);
            await db.query(stationConfigSql, stationConfigValue);           // update station_config
            await db.query(userPreferencesSql, userDailySummaryValues);     // set user daily summary preferences
            await db.query(userPreferencesSql, userNewDetectionEmailValues); // set user new detection email preferences
            await db.query(userPreferencesSql, userNewDetectionToastValues); // set user new detection toast preferences
            await db.query(userPreferencesSql, userLowStorageEmailValues);   // set user low storage email preferences
            await db.query('COMMIT');
            
            return result.rows[0];
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }
}

// Removes a users access permissions from a station
export async function removeUserFromStation(userId, stationId) {
    const sql = `
        DELETE FROM user_station
        WHERE user_id = $1 AND station_id = $2
        RETURNING *
    `;

    const result = await db.query(sql, [userId, stationId]);
    return result.rowCount;
}

// Updates the configuration for a station
export async function updateStationConfig(stationId, configData) {
    const storedStation = await getStationById(stationId);
    const apiKey = storedStation.api_key;

    const newConfig = generateCustomUserConfig(stationId, apiKey, configData);

    const sql = `
        UPDATE station
        SET station_config = $1, station_name = $2
        WHERE station_id = $3
        RETURNING *
    `;

    const values = [newConfig, configData.stationName, stationId];
    const result = await db.query(sql, values);
    return result.rows[0].station_config || null;
}

// Creates a new station status record
export async function createStationStatus(stationId, statusData) {
    const { is_recording, cpu_temp, memory_usage, disk_usage, battery } = statusData;
    const values = [is_recording, cpu_temp, memory_usage, disk_usage, battery, stationId];

    const sql = `
        INSERT INTO station_status (
            is_recording, 
            cpu_temp, 
            memory_usage_percent, 
            disk_usage_percent, 
            battery_level_percent, 
            station_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;

    const result = await db.query(sql, values);
    return result.rows[0] || null;
}

// Relays a request to a specific station's Flask API
export async function relayToStation(stationId, path, method, body=null) {
    try {
        const station = await getStationById(stationId);

        if (!station) {
            throw new Error(`Station with ID ${stationId} not found`);
        }

        const { station_host, station_port, api_key } = station;
        const url = `http://${station_host}:${station_port}/${path}`;
        console.log(`Relaying request to station ${stationId} at ${url}`);

        const response = await axios({
            method,
            url,
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            },
            data: body
        });

        return response;
    } catch (error) {
        throw new Error(`Error relaying request to station ${stationId} at ${path}: ${error.message}`);
    }
}


//// Helper functions for station management  //////

// Checks if a station is available for registration
async function canRegisterStation(stationId, userId, apiKey) {
    const storedStation = await getStationById(stationId);
    if (!storedStation) {
        throw new Error(`Station with ID ${stationId} does not exist`);
    }

    if (storedStation.api_key != apiKey) {
        throw new Error(`API key mismatch for Station ID ${stationId}`);
    }

    const stationAvailable = await db.query(`
        SELECT 1
        FROM user_station
        WHERE user_id = $1 AND station_id = $2 AND station_user_type_id = $3
    `, [userId, stationId, STATION_USER_TYPE_ID.Owner]);

    if (stationAvailable.rows.length) {
        throw new Error(`Station with ID ${stationId} is already registered to another user`);
    }

    return storedStation;
}

// Retrieves active station IDs over the specified date range
export async function getActiveStationIds(startDate, endDate) {
    const sql = `
        SELECT DISTINCT station_id
        FROM detection
        WHERE detection_timestamp BETWEEN $1 AND $2
    `;

    const result = await db.query(sql, [startDate, endDate]);
    return result.rows || [];
}


// Retrieve last status update from all stations
export async function getLastStationStatusUpdates() {
    const sql = `
        SELECT DISTINCT ON (station_status.station_id) *
        FROM station_status
        JOIN station ON station_status.station_id = station.station_id
        ORDER BY station_status.station_id, station_status.created_at DESC
    `;

    const result = await db.query(sql);
    return result.rows || [];
}