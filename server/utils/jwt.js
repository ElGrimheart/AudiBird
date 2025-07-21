import jwt from "jsonwebtoken";

// Generates a JWT token with the provided user information
export function generateJwtToken(user) {
    const payload = {
        userId: user.userId,
        username: user.username,
        userTypeId: user.user_type_id
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '2h' });
}

export function verifyJwtToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}