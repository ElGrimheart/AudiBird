import db from "../config/db-conn.js";

// GET /api/:stationId/detections route - retrieves all detections for a given station
export const getDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    console.log(`Retrieving detections for Station ID: ${stationId}`);

    const detectionsByStationSQL = `SELECT * FROM detection WHERE station_id=$1`;

    try {
        const result = await db.query(detectionsByStationSQL, [stationId]);
        const rows = result.rows;
        if (rows.length > 0) {
            console.log(`Detections for Station ID: ${stationId} retrieved successfully`);
            res.status(200).json({
                status: "success",
                message: `Detections for Station ID: ${stationId} retrieved`,
                result: rows
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No detections found for Station ID: ${stationId}`
            });
        }
    } catch (err) {
        console.error(`Error retrieving detections by station ID: ${err.message}`);
        res.status(500).json({
            status: "error",
            message: `Error retrieving detections for Station ID: ${stationId}`,
            error: err.message
        });
    }
};