import db from '../config/db-conn.js';
import { hashPassword, comparePassword } from '../utils/hasher.js';
import { newUserQueue } from '../queues/new-user-queue.js';


// Retrieves a user by their email
async function getUserByEmail(email) {
    const sql = `SELECT user_id, name, username, email, password, users.user_type_id 
        FROM users 
        JOIN user_type ON users.user_type_id = user_type.user_type_id
        WHERE email=$1`;

    const result = await db.query(sql, [email]);

    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}

// Retrieves a user by their username
async function getUserByUsername(username) {
    const sql = `SELECT user_id, name, username, email, password, users.user_type_id 
        FROM users
        JOIN user_type ON users.user_type_id = user_type.user_type_id
        WHERE username=$1`;

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

// Retrieves a user by their ID
export async function getUserById(userId) {
    const sql = `SELECT user_id, name, username, email, password, users.user_type_id 
        FROM users 
        WHERE user_id=$1`;

    const result = await db.query(sql, [userId]);

    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}

// Retrieves a users station list by user ID
export async function getUserStations(userId) {
    const sql = `SELECT station.station_id, station.station_name, user_station.station_user_type_id, station_user_type.role
        FROM user_station
        JOIN station ON user_station.station_id = station.station_id
        JOIN station_user_type ON user_station.station_user_type_id = station_user_type.station_user_type_id
        WHERE user_id=$1`;

    const result = await db.query(sql, [userId]);

    if (result.rowCount === 0) {
        return [];
    }
    return result.rows;
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
        const defaultUserTypeId = 2;        // 1 = Admin, 2 = User
        const hashedPassword = await hashPassword(password);

        const sql = `
            INSERT INTO users (name, username, email, password, user_type_id) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;

        const values = [
            name,
            username,
            email,
            hashedPassword,
            defaultUserTypeId
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

// Retrieves users details by their notification preferences
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
        whereClause += ` AND user_preferences.confidence_threshold <= $4`;
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