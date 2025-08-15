import * as userService from "../services/user-service.js";
import { generateJwtToken } from "../utils/jwt.js";
import logAction from "../utils/logger.js";


// GET /api/users/:userId route - retrieves user by ID
export const getUserById = async (req, res) => {
    const { userId } = req.params;
    logAction("Get user by ID", { userId });
    
    try {
        const user = await userService.getUserById(userId);
        if (user) {
            res.status(200).json({
                status: "success",
                message: `Retrieved user ID: ${userId}`,
                result: user
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: "User not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving user ID: ${userId}`,
            error: error.message
        });
    }
};


// GET /api/users/stations route - retrieves a list of users stations
export const getUserStations = async (req, res) => {
    const userId = req.user.userId;
    logAction("Getting user's stations", { userId });

    try {
        const stations = await userService.getUserStations(userId);

        if (stations && stations.length > 0) {
            res.status(200).json({
                status: "success",
                message: `Retrieved stations for user ID: ${userId}`,
                result: stations
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No stations found for user ID: ${userId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving stations for user ID: ${userId}`,
            error: error.message
        });
    }
};

// GET /api/users/preferences/:stationId - retrieves users preferences for a station
export const getUserPreferencesByStationId = async (req, res) => {
    const { stationId } = req.params;
    const userId = req.user.userId;
    logAction("Getting user preferences", { userId, stationId });

    try {
        const preferences = await userService.getUserPreferencesByStationId(userId, stationId);
        if (preferences) {
            res.status(200).json({
                status: "success",
                message: `Retrieved preferences for station ID: ${stationId}`,
                result: preferences
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No preferences found for station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving preferences for station ID: ${stationId}`,
            error: error.message
        });
    }
};

// POST /api/users/login route - logs in a user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    logAction("User login attempt", { email });

    try {
        const validUser = await userService.loginUser(email, password);

        if (validUser) {
            const token = await generateJwtToken(validUser.user_id);

            res.status(200).json({
                status: "success",
                message: "User logged in successfully",
                result: {
                    jwt: token
                }
            });
        }
    } catch (error) {
        if (error.message === 'User not found' || error.message === 'Invalid password') {
            res.status(401).json({
                status: "failure",
                message: "Invalid login credentials"
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "Error logging in user",
                error: error.message
            });
        }
    }
};

// POST /api/users/register route - registers a new user
export const registerUser = async (req, res) => {
    const { name, username, email, password } = req.body;

    logAction("User registration attempt", { email });

    try {
        const newUser = await userService.registerUser(name, username, email, password);
        if (newUser) {
            const token = await generateJwtToken(newUser.user_id);
            res.status(200).json({
                status: "success",
                message: "User registered successfully",
                result: {
                    jwt: token
                }
            });
        } 
    } catch (error) {
        if (error.message === 'Email already exists') {
            res.status(409).json({
                status: "failure",
                message: error.message
            });
        } else if (error.message === 'Username already exists') {
            res.status(409).json({
                status: "failure",
                message: error.message
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "Error registering user",
                error: error.message
            });
        }
    }
};

// POST /api/users/logout route - logs out a user
export const logoutUser = async (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            message: "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error logging out user",
            error: error.message
        });
    }
};

// POST /api/users/preferences/:stationId - update a users notification preferences for a station
export const updateUserPreferencesByStationId = async (req, res) => {
    const { stationId } = req.params;
    const userId = req.user.userId;
    const preferences = req.body;

    logAction("Updating user preferences", { userId, stationId, preferences });

    try {
        const updatedPreferences = await userService.updateUserPreferencesByStationId(userId, stationId, preferences);

        if (updatedPreferences) {
            res.status(200).json({
                status: "success",
                message: `Updated preferences for station ID: ${stationId}`,
                result: updatedPreferences
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No preferences found for station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error updating preferences for station ID: ${stationId}`,
            error: error.message
        });
    }
};
