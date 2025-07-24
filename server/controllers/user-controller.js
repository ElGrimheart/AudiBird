import * as userService from "../services/user-service.js";
import { generateJwtToken } from "../utils/jwt.js";
import handleError from "../utils/errorHandler.js";
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
                message: "User retrieved successfully",
                result: user
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: "User not found"
            });
        }
    } catch (error) {
        handleError(res, error, "Error retrieving user");
    }
};

// POST /api/users/login route - logs in a user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    logAction("User login attempt", { email });

    try {
        const validUser = await userService.loginUser(email, password);

        if (validUser) {
            const userToken = generateJwtToken(validUser);

            res.status(200).json({
                status: "success",
                message: "User logged in successfully",
                result: {
                    userToken
                }
            });
        } else {
            handleError(res, error, "Error logging in user");
        }
    } catch (error) {
        if (error.message === 'User not found' || error.message === 'Invalid password') {
            res.status(401).json({
                status: "failure",
                message: "Invalid login credentials"
            });
        } else {
            handleError(res, error, "Error logging in user");
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
        handleError(res, error);
    }
};


// POST /api/users/register route - registers a new user
export const registerUser = async (req, res) => {
    const { name, username, email, password } = req.body;

    logAction("User registration attempt", { email });

    try {
        const newUser = await userService.registerUser(name, username, email, password);
        if (newUser) {
            const userToken = generateJwtToken(newUser);
            res.status(200).json({
                status: "success",
                message: "User registered successfully",
                result: {
                    userToken
                }
            });
        } else {
            res.status(400).json({
                status: "failure",
                message: "Error registering user"
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
            handleError(res, error, "Error registering user");
        }
    }
};