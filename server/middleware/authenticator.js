// Middleware for authenticating access permissions for users and stations
import { param, validationResult } from 'express-validator';
import { verifyJwtToken } from "../utils/jwt.js";
import { getStationById } from "../services/station-service.js";
import { CLIENT_USER_TYPE_ID, STATION_USER_TYPE_ID } from '../constants/database-type-id.js';

// Validates station UUID format
export const validateStationId = [
    param("stationId")
        .exists()
        .withMessage("Station ID is required")
        .isUUID()
        .withMessage("Station ID must be a valid UUID"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: "failure",
                errors: errors.array(),
            });
        }
        next();
    },
];

// Validates detection UUID format
export const validateDetectionId = [
    param('detectionId')
      .exists().withMessage('Detection ID is required')
      .isUUID().withMessage('Detection ID must be a valid UUID'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({
              status: "failure",
              errors: errors.array()
          });
      }
      next();
    }
];



// Authenticates user supplied JWT token. Ensures user is registered and logged in
// Adds user info to request object if valid.
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "failure",
            message: "Missing authentication token"
        });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyJwtToken(token);

    if (!payload) {
        return res.status(403).json({
            status: "failure",
            message: "Forbidden: Invalid token"
        });
    }

    req.authType = "JWT";
    req.user = payload;
    next();
};

// Authenticates API key for posts from station.  Ensures station has been registered and API key matches
// Adds station info to request object if valid.
export const authenticateApiKey = async (req, res, next) => {
    const stationId = req.params.stationId;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "failure",
            message: "Missing API key"
        });
    }

    const reqApiKey = authHeader.split(" ")[1];

    try {
        const storedStation = await getStationById(stationId);

        if (!storedStation) {
            return res.status(404).json({
                status: "failure",
                message: `Station ID: ${stationId} not found`
            });
        }

        if (storedStation.api_key !== reqApiKey) {
            return res.status(403).json({
                status: "failure",
                message: "Forbidden: Invalid API key"
            });
        }

        req.authType = "API";
        req.station = storedStation;
        next();

    } catch (error) {
        return res.status(500).json({
            status: "failure",
            message: "Internal server error"
        });
    }
}

// Dual authentication for routes that accept either JWT or API key for access
// Checks if the request has a valid JWT or API key, and adds user/station info accordingly
export const dualAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const stationId = req.params.stationId;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "failure",
            message: "Missing authentication token"
        });
    }

    const token = authHeader.split(" ")[1];

    // Check if the token is a valid JWT - validate as user
    const jwtPayload = verifyJwtToken(token);
    if (jwtPayload) {
        req.authType = "JWT";
        req.user = jwtPayload;
        return authenticateAccessPermission(req, res, next); // Check access permission for user
    }

    // Else check if it's an API key - validate against stored api key of station
    try {
        const storedStation = await getStationById(stationId);
        
        if (!storedStation) {
            return res.status(404).json({
                status: "failure",
                message: `Station ID: ${stationId} not found`
            });
        }

        if (storedStation.api_key !== token) {
            return res.status(403).json({
                status: "failure",
                message: "Forbidden: Invalid authentication"
            });
        }

        req.authType = "API";
        req.station = storedStation;
        return next();

    } catch (error) {
        return res.status(500).json({
            status: "failure",
            message: "Internal server error"
        });
    }
};


// Check if the user has access permission to the station
export const authenticateAccessPermission = async (req, res, next) => {
    if (isAdmin(req.user)) {
        return next();
    }

    const stationId = req.params.stationId;
    const stationPermissions = req.user.stations;

    if (!stationPermissions || !stationPermissions[stationId]) {
        return res.status(403).json({
            status: "failure",
            message: "Forbidden: You do not have access to this station"
        });
    }   

    next();
}

// Check if the user has write permission for the station
export const authenticateWritePermission = async (req, res, next) => {
    if (isAdmin(req.user)) {
        return next();
    }

    const stationId = req.params.stationId;
    const stationPermissions = req.user.stations;

    if (!stationPermissions || !(stationPermissions[stationId] === STATION_USER_TYPE_ID.Owner || stationPermissions[stationId] === STATION_USER_TYPE_ID.Admin)) {
        return res.status(403).json({
            status: "failure",
            message: "Forbidden: You do not have access to this station"
        });
    }  
    
    next();
};


// Helper function to check if the user is an admin - bypasses other access permission checks if true
function isAdmin (user) {
    return user.userTypeId === CLIENT_USER_TYPE_ID.Admin;
}
