import { verifyJwtToken } from "../utils/jwt.js";
import { getUsersStationPermissions } from "../services/user-service.js";

// Authenticates the user by verifying the JWT token. Attaches user info to the request object.
export const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            status: "failure",
            message: "Unauthorized access"
        });
    }

    const decoded = verifyJwtToken(token);
    if (!decoded) {
        return res.status(401).json({
            status: "failure",
            message: "Invalid token"
        });
    }

    req.user = decoded;
    next();
};

// Check if the user has permission to access the station
export const authenticateAccessPermission = async (req, res, next) => {
    const user_type_id = req.user.user_type_id;
    if (user_type_id === 1) {               // user_type_id: 1 = 'Admin'
        return next();
    }

    const userId = req.user.userId;
    const stationId = req.params.stationId;

    const authorisedUser = await getUsersStationPermissions(userId, stationId);
    if (!authorisedUser) {
        return res.status(403).json({
            status: "failure",
            message: "Forbidden: You do not have access to this station"
        });
    }

    next();
}

// Check if the user has write permission for the station
export const authenticateWritePermission = async (req, res, next) => {
    const user_type_id = req.user.user_type_id;
    if (user_type_id === 1) {               // user_type_id: 1 = 'Admin'
        return next();
    }

    const userId = req.user.userId;
    const stationId = req.params.stationId;

    const userStationType = await getUsersStationPermissions(userId, stationId);
    if (!userStationType || userStationType === 3) {        // user_station_type_id: 3 = 'Viewer'
        return res.status(403).json({
            status: "failure",
            message: "Forbidden: You do not have write access to this station"
        });
    }

    next();
};