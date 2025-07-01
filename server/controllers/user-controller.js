import db from "../config/db-conn.js";
//import * as hasher from '../utils/hasher.js';

// GET /api/users/:id route - retrieves a user record by user_id
export const getUserByUsername = async (req, res) => {
    //const { username } = req.params;
    const username = "default_user"

    const userByUsernameSQL = `SELECT * FROM users WHERE username=$1`;
    
    try {
        const result = await db.query(userByUsernameSQL, [username]);
        const rows = result.rows;
        if (rows.length > 0) {
            console.log(`User ID: ${username} retrieved successfully`);
            console.log(rows);
            res.status(200);
            res.json({
                status: "success",
                message: `User ID: ${username} retrieved`,
                result: rows
            });
        } else {
            res.status(404);
            res.json({
                status: "failure",
                message: `User ID: ${username} not found`
            });
        }
    } catch (err) {
        console.error(`Error retrieving user by username: ${err.message}`);
        
    }
};
