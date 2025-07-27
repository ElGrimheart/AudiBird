import db from '../config/db-conn.js';
import { hashPassword, comparePassword } from '../utils/hasher.js';

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

// Checks user credentials and returns user data if valid email and password provided
export const loginUser = async (email, password) => {
    const storedUser = await getUserByEmail(email);
    if (!storedUser) {
        throw new Error('User not found');
    }

    // Verify password
    const validPassword = await comparePassword(password, storedUser.password);
    if (!validPassword) {
        throw new Error('Invalid password');
    }

    // Get users stations and permissions
    const userStations = await getUserStations(storedUser.user_id);

    const stationPermissions = {};
    userStations.forEach(station => {
        console.log(`Station ID: ${station.station_id}, User Type: ${station.station_user_type_id}`);
        stationPermissions[station.station_id] = station.station_user_type_id;
    });

    const safeUser = {
        userId: storedUser.user_id,
        user_type_id: storedUser.user_type_id,
        stations: stationPermissions
    };

    return safeUser;
}


// Registers a new user with the provided details
export const registerUser = async (name, username, email, password) => {
    let storedUser = await getUserByEmail(email);
    if (storedUser) {
        throw new Error('Email already exists');
    }

    storedUser = await getUserByUsername(username);
    if (storedUser) {
        throw new Error('Username already exists');
    }
    
    
    const defaultUserTypeId = 2; 
    const hashedPassword = await hashPassword(password);

    const sql = `INSERT INTO users (name, username, email, password, user_type_id) 
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

    const safeUser = {
        userId: newUser.rows[0].user_id,
        user_type_id: newUser.rows[0].user_type_id,
        stations: {}
    };

    return safeUser;
};

// Retrieves a users station list by user ID
export const getUserStations = async (userId) => {
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

// Returns the user_station_type_id for the given user and station
// 1 = Owner, 2 = Admin, 3 = Viwer
export const getUsersStationPermissions = async (userId, stationId) => {
    const sql = `SELECT station_user_type_id 
        FROM user_station 
        WHERE user_id=$1 AND station_id=$2`;

    const result = await db.query(sql, [userId, stationId]);

    if (result.rowCount === 0) {
        return null; // User does not have access to the station
    }

    return result.rows[0].station_user_type_id; 
}