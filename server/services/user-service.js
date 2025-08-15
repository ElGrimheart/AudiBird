import db from '../config/db-conn.js';
import { hashPassword, comparePassword } from '../utils/hasher.js';
import { CLIENT_USER_TYPE_ID, NOTIFICATION_EVENT_TYPE_ID, NOTIFICATION_CHANNEL_TYPE_ID } from '../constants/database-type-id.js';
import { newUserQueue } from '../queues/new-user-queue.js';


// Retrieves a user by their ID
export async function getUserById(userId) {
    const sql = `
        SELECT user_id, name, username, email, password, users.user_type_id 
        FROM users 
        WHERE user_id=$1
    `;

    const result = await db.query(sql, [userId]);

    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}

// Retrieves a users station list by user ID
export async function getUserStations(userId) {
    const sql = `
        SELECT station.station_id, station.station_name, user_station.station_user_type_id, station_user_type.role
        FROM user_station
        JOIN station ON user_station.station_id = station.station_id
        JOIN station_user_type ON user_station.station_user_type_id = station_user_type.station_user_type_id
        WHERE user_id=$1
    `;

    const result = await db.query(sql, [userId]);

    if (result.rowCount === 0) {
        return [];
    }
    return result.rows;
}

// Retrieves users notification preferences for a specific station
export async function getUserPreferencesByStationId(userId, stationId) {
    const sql = `
        SELECT *
        FROM user_preferences
        WHERE user_id = $1 AND station_id = $2
    `;

    const result = await db.query(sql, [userId, stationId]);
    console.log("User preferences query result:", result);

    if (result.rowCount === 0) {
        return null;
    }

    // Map result rows to user preferences
    const dailySummaryRow = result.rows.find(
        row => row.event_type_id === NOTIFICATION_EVENT_TYPE_ID.DailySummary && row.channel_type_id === NOTIFICATION_CHANNEL_TYPE_ID.Email
    );
    const newDetectionInAppRow = result.rows.find(
        row => row.event_type_id === NOTIFICATION_EVENT_TYPE_ID.NewDetection && row.channel_type_id === NOTIFICATION_CHANNEL_TYPE_ID.Toast
    );
    const newDetectionEmailRow = result.rows.find(
        row => row.event_type_id === NOTIFICATION_EVENT_TYPE_ID.NewDetection && row.channel_type_id === NOTIFICATION_CHANNEL_TYPE_ID.Email
    );
    const lowStorageEmailRow = result.rows.find(
        row => row.event_type_id === NOTIFICATION_EVENT_TYPE_ID.LowStorage && row.channel_type_id === NOTIFICATION_CHANNEL_TYPE_ID.Email
    );

    const userPreferences = {
        dailySummaryEmail: !!dailySummaryRow?.enabled,
        newDetectionInApp: !!newDetectionInAppRow?.enabled,
        newDetectionInAppThreshold: newDetectionInAppRow?.threshold ?? 0,
        newDetectionEmail: !!newDetectionEmailRow?.enabled,
        newDetectionEmailThreshold: newDetectionEmailRow?.threshold ?? 0,
        lowStorageEmail: !!lowStorageEmailRow?.enabled,
        lowStorageEmailThreshold: lowStorageEmailRow?.threshold ?? 0
    };
    console.log("User preferences retrieved:", userPreferences);

    return userPreferences;
}

// Checks user credentials and returns user data if valid email and password provided
export async function loginUser(email, password) {
    const storedUser = await getUserByEmail(email);
    if (!storedUser) {
        throw new Error('User not found');
    }

    // Verify password
    const validPassword = await comparePassword(password, storedUser.password);
    if (!validPassword) {
        throw new Error('Invalid password');
    }

    // Update last login record
    const sql = `UPDATE users SET last_login = NOW() WHERE user_id = $1`;
    await db.query(sql, [storedUser.user_id]);

    return storedUser;
}


// Registers a new user with the provided details
export async function registerUser(name, username, email, password) {
    if (await canRegisterUser(email, username)) {
        const hashedPassword = await hashPassword(password);

        const sql = `
            INSERT INTO users (name, username, email, password, user_type_id) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            name,
            username,
            email,
            hashedPassword,
            CLIENT_USER_TYPE_ID.User
        ]

        const newUser = await db.query(sql, values);

        if (newUser.rowCount === 0) {
            throw new Error('User registration failed');
        }

        await newUserQueue.add({
            userEmail: email,
            newUser: newUser.rows[0]
        });

        return newUser.rows[0];
    }
}

// Updates a users notification preferences for a specific station
export async function updateUserPreferencesByStationId(userId, stationId, userPreferences) {
    // Map user preferences to database fields
    const mappings = [
        {
            enabled: userPreferences.dailySummaryEmail,
            threshold: 0,
            event_type_id: NOTIFICATION_EVENT_TYPE_ID.DailySummary,
            channel_type_id: NOTIFICATION_CHANNEL_TYPE_ID.Email,
        },
        {
            enabled: userPreferences.newDetectionInApp,
            threshold: (userPreferences.newDetectionInAppThreshold),
            event_type_id: NOTIFICATION_EVENT_TYPE_ID.NewDetection,
            channel_type_id: NOTIFICATION_CHANNEL_TYPE_ID.Toast,
        },
        {
            enabled: userPreferences.newDetectionEmail,
            threshold: (userPreferences.newDetectionEmailThreshold),
            event_type_id: NOTIFICATION_EVENT_TYPE_ID.NewDetection,
            channel_type_id: NOTIFICATION_CHANNEL_TYPE_ID.Email,
        },
        {
            enabled: userPreferences.lowStorageEmail,
            threshold: (userPreferences.lowStorageEmailThreshold),
            event_type_id: NOTIFICATION_EVENT_TYPE_ID.LowStorage,
            channel_type_id: NOTIFICATION_CHANNEL_TYPE_ID.Email,
        },
    ];

    // Try update existing rows with new preferences
    try {
        await db.query('BEGIN');
        for (const pref of mappings) {
            const updateSql = `
                UPDATE user_preferences
                SET enabled = $1, threshold = $2
                WHERE user_id = $3 AND station_id = $4 AND event_type_id = $5 AND channel_type_id = $6
            `;
            const updateValues = [
                pref.enabled,
                pref.threshold,
                userId,
                stationId,
                pref.event_type_id,
                pref.channel_type_id,
            ];
            const updateResult = await db.query(updateSql, updateValues);

            // If no existing row, insert new one
            if (updateResult.rowCount === 0) {
                const insertSql = `
                    INSERT INTO user_preferences (user_id, station_id, event_type_id, channel_type_id, enabled, threshold)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;
                const insertValues = [
                    userId,
                    stationId,
                    pref.event_type_id,
                    pref.channel_type_id,
                    pref.enabled,
                    pref.threshold,
                ];
                await db.query(insertSql, insertValues);
            }
        }
        await db.query('COMMIT');
        return userPreferences;
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
}

// Retrieves users details based on their notification preferences
export async function getUsersByPreferences(stationId, eventTypeId, channelTypeId, { confidence } = {}) {
    const values = [stationId, eventTypeId, channelTypeId];
    console.log("Retrieving users by preferences:", {
        stationId,
        eventTypeId,
        channelTypeId,
        confidence
    });
    
    let whereClause = `
        WHERE user_preferences.enabled = true
        AND user_preferences.station_id = $1
        AND user_preferences.event_type_id = $2
        AND user_preferences.channel_type_id = $3
    `;

    if (confidence) {
        values.push(confidence);
        whereClause += ` AND user_preferences.threshold <= $4`;
    }

    const sql = `
        SELECT users.name, users.email, station.station_name
        FROM users
        JOIN user_preferences ON users.user_id = user_preferences.user_id
        JOIN station ON user_preferences.station_id = station.station_id
        ${whereClause}
    `;

    const result = await db.query(sql, values);

    if (result.rowCount === 0) {
        return [];
    }
    return result.rows;
}


// Helper function for user management

// Retrieves a user by their email
async function getUserByEmail(email) {
    const sql = `
        SELECT user_id, name, username, email, password, users.user_type_id 
        FROM users 
        JOIN user_type ON users.user_type_id = user_type.user_type_id
        WHERE email=$1
    `;

    const result = await db.query(sql, [email]);

    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}

// Retrieves a user by their username
async function getUserByUsername(username) {
    const sql = `
        SELECT user_id, name, username, email, password, users.user_type_id 
        FROM users
        JOIN user_type ON users.user_type_id = user_type.user_type_id
        WHERE username=$1
    `;

    const result = await db.query(sql, [username]);

    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}

// Checks if a user can register with the provided email and username
async function canRegisterUser(email, username) {
    let storedUser = await getUserByEmail(email);
    if (storedUser) {
        throw new Error('Email already exists');
    }

    storedUser = await getUserByUsername(username);
    if (storedUser) {
        throw new Error('Username already exists');
    }

    return true;
}