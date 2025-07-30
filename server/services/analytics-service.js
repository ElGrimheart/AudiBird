import db from "../config/db-conn.js";
import { normaliseDateToStartOfDay, normaliseDateToEndOfDay } from "../utils/dateFormatter.js";
import { buildDetectionWhereClause } from "../utils/sqlBuilder.js";
import logAction from "../utils/logger.js";
import handleError from "../utils/errorHandler.js";

// Retrieves the average detections within a date range for a given station ID
export async function getAverageDetectionWithinDates(stationId, { startDate, endDate }) {
    
    // Default to the last 7 days if no dates are provided
    startDate = startDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    endDate = endDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Normalize dates to start and end of the day
    const start = normaliseDateToStartOfDay(new Date(startDate));
    const end = normaliseDateToEndOfDay(new Date(endDate));
    
    const sql = `
        SELECT
            hour_of_day,
            AVG(hourly_count) AS average_detections
        FROM (
            SELECT
                DATE_TRUNC('hour', detection_timestamp) AS hour,
                EXTRACT(HOUR FROM detection_timestamp) AS hour_of_day,
                COUNT(*) AS hourly_count
            FROM detection
            WHERE station_id = $1
            AND detection_timestamp BETWEEN $2 AND $3
            GROUP BY hour, hour_of_day
        ) AS hourly_counts
        GROUP BY hour_of_day
        ORDER BY hour_of_day
    `;

    const values = [stationId, start.toISOString(), end.toISOString()];

    const result = await db.query(sql, values);
    
    // Apply default values for hours with no detections
    const hoursMap = {};
    result.rows.forEach(row => {
        hoursMap[row.hour_of_day] = Number(row.average_detections);
    });
    const fullResult = Array.from({ length: 24 }, (_, hour) => ({
        hour_of_day: hour,
        average_detections: hoursMap[hour] ?? 0
    }));

    return fullResult;
}


// Retrieves species trends for a given station ID
export async function getSpeciesTrends(stationId, { startDate, endDate, speciesName, minConfidence }) {
    // Default to the last 7 days if no dates are provided
    startDate = startDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    endDate = endDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Correct hours to midnight
    startDate = normaliseDateToStartOfDay(startDate);
    endDate = normaliseDateToEndOfDay(endDate);

    const filters = {startDate, endDate, speciesName, minConfidence};

    const { whereClause, values } = buildDetectionWhereClause(stationId, filters);

    const sql = `
        SELECT DATE(detection_timestamp) AS DATE, common_name, COUNT(*) AS count
        FROM detection
        ${whereClause}
        GROUP BY DATE, common_name
        ORDER BY DATE;
    `;

    const result = await db.query(sql, values);
    
    return result.rows;
}


// Retrieves species composition for a given station ID
//export async function getSpeciesComposition(stationId, { startDate, endDate, minConfidence }) {