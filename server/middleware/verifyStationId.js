import db from '../config/db-conn.js';

/**
 * Middleware to verify if a station ID exists in the database.
 * If the station ID is valid, it attaches the station data to the request object.
 * Otherwise returns an error response.
 */
const verifyStationId = async (req, res, next) => {
    const { stationId } = req.params;

    const stationSQL = `SELECT station_id FROM station WHERE station_id=$1`;

    try {
        const result = await db.query(stationSQL, [stationId]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: "failure",
                message: `Station ID: ${stationId} not found`
            });
        }
        req.station = result.rows[0];
        next();
    } catch (error) {      // Check for invalid UUID error
        if (error.code === '22P02' && error.message.includes('uuid')) {
            return res.status(400).json({
                status: "failure",
                message: `Invalid station ID format: ${stationId}`
            });
        }
        
        return res.status(500).json({
            status: "error",
            message: "Database error while verifying station ID",
            error: error.message
        });
    }
};

export default verifyStationId;