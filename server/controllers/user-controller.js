import db from "../config/db-conn.js";
//import * as hasher from '../utils/hasher.js';

// GET /api/users/:userId route - retrieves a user record by user_id
export const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    const userByUsernameSQL = `SELECT * FROM users WHERE username=$1`;
    
    try {
        const result = await db.query(userByUsernameSQL, [username]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: "failure",
                message: `User with username: ${username} not found`
            });
        }
        
        const user = result.rows[0];
        res.status(200).json({
            status: "success",
            message: `User with username: ${username} retrieved`,
            result: user
        });
    } catch (err) {
        console.error(`Error retrieving user by username: ${err.message}`);
        res.status(500).json({
            status: "error",
            message: `Error retrieving user with username: ${username}`,
            error: err.message
        });
    }
};
