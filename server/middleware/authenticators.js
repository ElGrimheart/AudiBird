import { verifyJwtToken } from "../utils/jwt.js";
import { getStationById } from "../services/station-service.js";

// Authenticates user supplied JWT token. Adds user info to request object if valid.
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

// Authenticates API key for station access. Adds station info to request object if valid.
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
// Checks if the request has a valid JWT or API key, and adds user or station info
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

    // Check if the token is a valid JWT
    const jwtPayload = verifyJwtToken(token);
    if (jwtPayload) {
        // Valid JWT - authenticate as user
        req.authType = "JWT";
        req.user = jwtPayload;
        return next();
    }

    // Else check if it's an API key
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


// Check if the user has permission to access the station
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

    if (!stationPermissions || !(stationPermissions[stationId] === 1 || stationPermissions[stationId] === 2)) {  // user_station_type_id: 1 = 'Owner', 2 = 'Admin'
        return res.status(403).json({
            status: "failure",
            message: "Forbidden: You do not have access to this station"
        });
    }  
    
    next();
};

// Helper function to check if the user is an admin
function isAdmin (user) {
    return user.userTypeId === 1; // user_type_id: 1 = 'Admin'
}
