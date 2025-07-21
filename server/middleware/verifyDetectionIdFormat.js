import db from '../config/db-conn.js';

/**
 * Middleware to verify if a detection ID is in the correct format
 */
const verifyDetectionIdFormat = async (req, res, next) => {
    const { detectionId } = req.params;

    if (!detectionId) {
        return res.status(400).json({
            status: "failure",
            message: "Detection ID is required"
        });
    }

    const detectionSQL = `SELECT * FROM detection WHERE detection_id=$1`;

    try {
        const result = await db.query(detectionSQL, [detectionId]);
        if (result.rowCount > 0) {
            next();
        }
    } catch (error) {      // Check for invalid UUID error
        if (error.code === '22P02' && error.message.includes('uuid')) {
            return res.status(400).json({
                status: "failure",
                message: `Invalid detection ID format: ${detectionId}`
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Database error while verifying detection ID",
            error: error.message
        });
    }
};

export default verifyDetectionIdFormat;
