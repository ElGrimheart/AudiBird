import db from '../config/db-conn.js';

/**
 * Middleware to verify if a station ID exists in the database.
 * If the station ID is valid, it attaches the station data to the request object.
 * If not, it responds with a 404 status and an error message.
 */
const verifyStationId = async (req, res, next) => {
    const { stationId } = req.params;

    const stationSQL = `SELECT station_id FROM station WHERE station_id=$1`;

    const result = await db.query(stationSQL, [stationId]);

    if (result.rowCount === 0) {
        return res.status(404).json({
            status: "failure",
            message: `Station ID: ${stationId} not found`
        });
    }

    req.station = result.rows[0];

    next();
};

export default verifyStationId;