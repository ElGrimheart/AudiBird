import jwt from "jsonwebtoken";

// Generates a JWT token with the provided user information
export function generateJwtToken(user) {
    const payload = {
        userId: user.userId,
        user_type_id: user.user_type_id,
        stations: user.stations || {}
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '2h' });
}

// Verifies the JWT token and returns the decoded payload
export function verifyJwtToken(token) {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}