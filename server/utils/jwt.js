import jwt from "jsonwebtoken";
import * as userService from "../services/user-service.js";

// Generates a JWT token with the provided user information
export async function generateJwtToken(userId) {
    
    // Get the user's station list and their associated station permissions
    const user = await userService.getUserById(userId);
    const userStations = await userService.getUserStations(user.user_id);

    const stationPermissions = {};
    userStations.forEach(station => {
        stationPermissions[station.station_id] = station.station_user_type_id;
    });

    // Create the JWT payload
    const payload = {
        userId: user.user_id,
        userTypeId: user.user_type_id,
        stations: stationPermissions || {}
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '2h' });
}

// Validates a JWT token and returns the decoded payload
export function verifyJwtToken(token) {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}
