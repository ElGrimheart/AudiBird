import db from "../config/db-conn.js";

// Utility function to check if a station exists
export const stationExists = async (stationId) => {
    const stationSQL = `SELECT 1 FROM station WHERE id=$1`;
    const result = await db.query(stationSQL, [stationId]);
    return result.rowCount > 0;
};


// GET /api/:stationId/detections/:detectionId route - retrieves a specific detection by ID for a given station
export const getDetectionById = async (req, res) => {
    const { stationId, detectionId } = req.params;

    console.log(`Retrieving detection ID: ${detectionId} for Station ID: ${stationId}`);

    if (!(await stationExists(stationId))) {
        return res.status(404).json({
            status: "failure",
            message: `Station ID: ${stationId} not found`
        });
    }

    const detectionSQL = 
        `SELECT * FROM detection
        WHERE station_id=$1 AND id=$2`;

    try {
        const result = await db.query(detectionSQL, [stationId, detectionId]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: "failure",
                message: `Detection ID: ${detectionId} not found for Station ID: ${stationId}`
            });
        }
        const detection = result.rows[0];
        res.status(200).json({
            status: "success",
            message: `Detection ID: ${detectionId} retrieved`,
            result: detection
        });
    } catch (err) {
        console.error(`Error retrieving detection by ID: ${err.message}`);
        res.status(500).json({
            status: "error",
            message: `Error retrieving detection ID: ${detectionId} for Station ID: ${stationId}`,
            error: err.message
        });
    }
};

// GET /api/:stationId/detections/all route - retrieves all detections for a given station
export const getAllDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    console.log(`Retrieving detections for Station ID: ${stationId}`);

    if (!(await stationExists(stationId))) {
        return res.status(404).json({
            status: "failure",
            message: `Station ID: ${stationId} not found`
        });
    }

    const detectionsByStationSQL = 
        `SELECT * FROM detection 
        WHERE station_id=$1`;

    try {
        const result = await db.query(detectionsByStationSQL, [stationId]);
        const rows = result.rows;
        res.status(200).json({
            status: "success",
            message: `All detections for Station ID: ${stationId} retrieved`,
            result: rows
        });
    } catch (err) {
        console.error(`Error retrieving detections by station ID: ${err.message}`);
        res.status(500).json({
            status: "error",
            message: `Error retrieving detections for Station ID: ${stationId}`,
            error: err.message
        });
    }
};

// GET /api/:stationId/detections/recent route - retrieves 10 most recent detections for a given station
export const getRecentDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;

    if (!(await stationExists(stationId))) {
        return res.status(404).json({
            status: "failure",
            message: `Station ID: ${stationId} not found`
        });
        
    }

    const recentDetectionsSQL = 
        `SELECT * FROM detection 
        WHERE station_id=$1 
        ORDER BY detection_time DESC 
        LIMIT 10`;

    try {
        const result = await db.query(recentDetectionsSQL, [stationId]);
        const rows = result.rows;
        res.status(200).json({
            status: "success",
            message: `Recent detections for Station ID: ${stationId} retrieved`,
            result: rows
        });
    } catch (err) {
        console.error(`Error retrieving recent detections by station ID: ${err.message}`);
        res.status(500).json({
            status: "error",
            message: `Error retrieving recent detections for Station ID: ${stationId}`,
            error: err.message
        });
    }
};


export const getMostCommonSpeciesByStationId = async (req, res) => {
    const { stationId } = req.params;

    if (!(await stationExists(stationId))) {
        return res.status(404).json({
            status: "failure",
            message: `Station ID: ${stationId} not found`
        });
    }

    const mostCommonSpeciesSQL = `
        SELECT common_name, COUNT(*) as count
        FROM detection
        WHERE station_id=$1
        GROUP BY common_name
        ORDER BY count DESC
        LIMIT 5`;

    try {
        const result = await db.query(mostCommonSpeciesSQL, [stationId]);
        const rows = result.rows;
        res.status(200).json({
            status: "success",
            message: `Most common species for Station ID: ${stationId} retrieved`,
            result: rows
        });
    } catch (err) {
        console.error(`Error retrieving most common species by station ID: ${err.message}`);
        res.status(500).json({
            status: "error",
            message: `Error retrieving most common species for Station ID: ${stationId}`,
            error: err.message
        });
    }
}

export const getDetectionSummaryByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { from, to, species } = req.query;

    const filters = [];
    const values = [stationId];

    let whereClause = 'WHERE station_id = $1';

    // Apply date filters
    if (from) {
        values.push(from);
        filters.push(`detection_time >= $${values.length}`);
    }

    if (to) {
        values.push(to);
        filters.push(`detection_time <= $${values.length}`);
    }

    // Apply species filter
    if (species) {
        values.push(`%${species}%`);
        filters.push(`(common_name ILIKE $${values.length} OR scientific_name ILIKE $${values.length})`);
    }

    if (filters.length > 0) {
        whereClause += ' AND ' + filters.join(' AND ');
    }

    try {
        // Total detections
        const totalDetections = await db.query(
        `SELECT COUNT(*) FROM detection ${whereClause}`,
        values
        );

        // Total distinct species
        const totalSpecies = await db.query(
        `SELECT COUNT(DISTINCT common_name) FROM detection ${whereClause}`,
        values
        );

        // Detections today
        const detectionsToday = await db.query(
        `SELECT COUNT(*) FROM detection 
        ${whereClause} AND detection_time >= CURRENT_DATE`,
        values
        );

        // Species today
        const speciesToday = await db.query(
        `SELECT COUNT(DISTINCT common_name) FROM detection 
        ${whereClause} AND detection_time >= CURRENT_DATE`,
        values
        );

        // Detections in the last hour
        const detectionsLastHour = await db.query(
        `SELECT COUNT(*) FROM detection 
        ${whereClause} AND detection_time >= NOW() - INTERVAL '1 hour'`,
        values
        );

        // Species in the last hour
        const speciesLastHour = await db.query(
        `SELECT COUNT(DISTINCT common_name) FROM detection 
        ${whereClause} AND detection_time >= NOW() - INTERVAL '1 hour'`,
        values
        );


        // Return summary
        res.json({
        total_detections: parseInt(totalDetections.rows[0].count),
        total_species: parseInt(totalSpecies.rows[0].count),
        detections_today: parseInt(detectionsToday.rows[0].count),
        species_today: parseInt(speciesToday.rows[0].count),
        detections_last_hour: parseInt(detectionsLastHour.rows[0].count),
        species_last_hour: parseInt(speciesLastHour.rows[0].count),
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getFilteredDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const {
        from,
        to,
        species,
        min_confidence,
        max_confidence,
        limit,
        offset,
        sort
    } = req.query;

    // Check if station exists
    if (!(await stationExists(stationId))) {
        return res.status(404).json({
            status: "failure",
            message: `Station ID: ${stationId} not found`
        });
    }

    let whereClauses = ['station_id = $1'];
    let values = [stationId];
    let idx = 2;

    // Date filters
    if (from) {
        whereClauses.push(`detection_time >= $${idx}`);
        values.push(from);
        idx++;
    }
    if (to) {
        whereClauses.push(`detection_time <= $${idx}`);
        values.push(to);
        idx++;
    }

    // Species filter (matches common or scientific name)
    if (species) {
        whereClauses.push(`(common_name ILIKE $${idx} OR scientific_name ILIKE $${idx})`);
        values.push(`%${species}%`);
        idx++;
    }

    // Confidence filters
    if (min_confidence) {
        whereClauses.push(`confidence >= $${idx}`);
        values.push(min_confidence);
        idx++;
    }
    if (max_confidence) {
        whereClauses.push(`confidence <= $${idx}`);
        values.push(max_confidence);
        idx++;
    }

    // Sorting
    const order = sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Pagination
    const lim = Math.max(parseInt(limit), 1);
    const off = Math.max(parseInt(offset), 0);

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
        SELECT *
        FROM detection
        ${whereSQL}
        ORDER BY detection_time ${order}
        LIMIT $${idx}
        OFFSET $${idx + 1}
    `;
    values.push(lim, off);

    try {
        const result = await db.query(sql, values);
        res.status(200).json({
            status: "success",
            message: `Filtered detections for Station ID: ${stationId} retrieved`,
            result: result.rows
        });
    } catch (err) {
        console.error(`Error filtering detections: ${err.message}`);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: err.message
        });
    }
}