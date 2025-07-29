import db from "../config/db-conn.js";

// Retrieves the average detections within a date range for a given station ID
export async function getAverageDetectionWithinDates(stationId, { startDate, endDate }) {
    
    startDate = startDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(); // Default to 7 days ago
    endDate = endDate || new Date(Date.now() - 1).toISOString();

    // Correct hours to midnight
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
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

