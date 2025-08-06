import db from "../config/db-conn.js";
import { normaliseDateToStartOfDay, normaliseDateToEndOfDay } from "../utils/dateFormatter.js";
import { buildDetectionWhereClause, buildDeltaFilters } from "../utils/sqlBuilder.js";

/* 
Generates average hourly trends of detections for a given station.
Returns an array of objects with hour and average_detections properties.
Filterable by date range, species name, and minimum confidence level.
If no filters are provided, returns to all species detections within the previous 7 days.
*/
export async function getAverageHourlyTrendsByStationId(stationId, { startDate, endDate, speciesName, minConfidence }) {
    // Default to the last 7 days if no dates are provided
    startDate = startDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    endDate = endDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Normalize dates to start and end of the day
    startDate = normaliseDateToStartOfDay(startDate);
    endDate = normaliseDateToEndOfDay(endDate);

    const filters = { startDate, endDate, speciesName, minConfidence };
    const { whereClause, values } = buildDetectionWhereClause(stationId, filters);

    const sql = `
        WITH hourly_counts AS (
            SELECT
                DATE(detection_timestamp) AS day,
                EXTRACT(HOUR FROM detection_timestamp) AS hour,
                COUNT(*) AS detections
            FROM detection
            ${whereClause}
            GROUP BY day, hour
            ),
            hourly_averages AS (
            SELECT
                hour,
                ROUND(AVG(detections)::numeric, 2) AS avg_detections
            FROM hourly_counts
            GROUP BY hour
            )
            SELECT * FROM hourly_averages
            ORDER BY hour;
    `;

    const result = await db.query(sql, values);

    // Apply 0 values for hours with no detections
    const hoursMap = {};
    result.rows.forEach(row => {
        hoursMap[row.hour] = Number(row.avg_detections);
    });
    const fullResult = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        average_detections: hoursMap[hour] ?? 0
    }));

    return fullResult;
}

export async function getSpeciesSummaryByStationId(stationId, { speciesName }) {
    const filters = { speciesName };
    const { whereClause, values } = buildDetectionWhereClause(stationId, filters);

    const sql = `
        WITH daily_counts AS (
            SELECT
                DATE(detection_timestamp) AS day,
                COUNT(*) AS total
            FROM detection
            ${whereClause}
            GROUP BY day
        )
        SELECT
            (SELECT COUNT(*) FROM detection ${whereClause}) AS total_detections,
            (SELECT MIN(detection_timestamp) FROM detection ${whereClause}) AS first_detection,
            (SELECT MAX(detection_timestamp) FROM detection ${whereClause}) AS last_detection,
            (SELECT day FROM daily_counts ORDER BY total DESC LIMIT 1) AS peak_day,
            (SELECT total FROM daily_counts ORDER BY total DESC LIMIT 1) AS peak_count,
            ROUND(AVG(total), 2) AS average_detections_per_day,
            (SELECT image_url FROM species_media WHERE species_code = (SELECT species_code FROM detection ${whereClause} LIMIT 1)) AS image_url,
            (SELECT image_rights FROM species_media WHERE species_code = (SELECT species_code FROM detection ${whereClause} LIMIT 1)) AS image_rights
        FROM daily_counts
    `;

    const result = await db.query(sql, values);
    console.log("Species Summary Result:", result.rows);
    return result.rows[0];
}

/*
Generates hourly detection totals for each species for a given station.
Returns an array of objects with hour, common_name, and count properties.
Filterable by a single date, species name, and minimum confidence level.
If no filters are provided, defaults to all species detections for current date
*/
export async function getHourlyDetectionTotalsByStationId(stationId, { singleDate, speciesName, minConfidence }) {
    // Default to the current date if no date is provided
    singleDate = singleDate || new Date(Date.now()).toISOString();

    const filters = { singleDate, speciesName, minConfidence };
    const { whereClause, values } = buildDetectionWhereClause(stationId, filters);

    const sql = `
        SELECT 
            DATE(detection_timestamp) AS DATE,
            EXTRACT(HOUR FROM detection_timestamp) AS hour,
            common_name,
            COUNT(*) AS count
        FROM detection
        ${whereClause}
        GROUP BY DATE, hour, common_name
        ORDER BY DATE, hour, common_name;
    `;

    const result = await db.query(sql, values);

    // Get all unique species in the result
    const speciesList = Array.from(new Set(result.rows.map(row => row.common_name)));

    // Build hour-species : count map
    const countMap = {};
    result.rows.forEach(row => {
        const hour = Number(row.hour);
        countMap[`${hour}|${row.common_name}`] = Number(row.count);
    });

    // Apply 0 values for hour-species with no detections
    const allHours = Array.from({ length: 24 }, (_, hour) => hour);
    const fullResult = [];
    speciesList.forEach(species => {
        allHours.forEach(hour => {
            fullResult.push({
                hour,
                common_name: species,
                count: countMap[`${hour}|${species}`] || 0
            });
        });
    });

    return fullResult;
}

/*
Generates daily detection totals for detections for a given station.
Returns an array of objects with date and count properties.
Filterable by date range, species name, and minimum confidence level.
If no filters are provided, returns all species detections within the previous 7 days.
*/
export async function getDailyDetectionTotalsByStationId(stationId, { startDate, endDate, speciesName, minConfidence }) {
    // Default to the last 7 days if no dates are provided
    startDate = startDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    endDate = endDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Correct hours to midnight
    startDate = normaliseDateToStartOfDay(startDate);
    endDate = normaliseDateToEndOfDay(endDate);

    const filters = {startDate, endDate, speciesName, minConfidence};
    const { whereClause, values } = buildDetectionWhereClause(stationId, filters);

    const sql = `
        SELECT 
            DATE(detection_timestamp) AS DATE, 
            common_name, 
            COUNT(*) AS count
        FROM detection
        ${whereClause}
        GROUP BY DATE, common_name
        ORDER BY DATE;
    `;

    const result = await db.query(sql, values);

    // Get all unique species in the result
    const speciesList = Array.from(new Set(result.rows.map(row => row.common_name)));

    // Build date-species : count map
    const countMap = {};
    result.rows.forEach(row => {
        const dateStr = row.date instanceof Date
            ? row.date.toISOString().slice(0, 10)
            : String(row.date).slice(0, 10);
        countMap[`${dateStr}|${row.common_name}`] = Number(row.count);
    });

    // Apply 0 values for date-species with no detections
    const allDates = getAllDatesInRange(startDate, endDate);
    const fullResult = [];
    allDates.forEach(dateStr => {
        speciesList.forEach(species => {
            fullResult.push({
                date: dateStr,
                common_name: species,
                count: countMap[`${dateStr}|${species}`] || 0
            });
        });
    });

    return fullResult;
}


// Helper function to get all dates in a given range
function getAllDatesInRange(startDate, endDate) {
    const start = new Date(String(startDate).slice(0, 10));
    const end = new Date(String(endDate).slice(0, 10));
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

/* Experimental: Deltas for detections, species, confidence and most common species. 
Not carried forward to production at this stage

// Retrieves deltas values for detections, species, confidence and most common species for a given station ID
export async function getDeltas(stationId, { currentStartDate, currentEndDate, speciesName, minConfidence }) {
    // Default to the last 7 days if no dates are provided
    currentStartDate = currentStartDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    currentEndDate = currentEndDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Correct hours to midnight
    currentStartDate = normaliseDateToStartOfDay(currentStartDate);
    currentEndDate = normaliseDateToEndOfDay(currentEndDate);

    // Calculate previous date range
    const range = currentEndDate - currentStartDate;
    const prevEndDate = new Date(currentEndDate - range);
    const prevStartDate = new Date(currentStartDate - range);

    // Build filters list
    const initialValues = [stationId, currentStartDate, currentEndDate, prevStartDate, prevEndDate];
    const {filterClause, filterValues} = buildDeltaFilters(initialValues.length, { speciesName, minConfidence });

    const values = [...initialValues, ...filterValues];

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM detection
                WHERE station_id = $1
                AND detection_timestamp BETWEEN $2 AND $3
                ${filterClause}
            ) AS current_total_detections,
            (SELECT COUNT(DISTINCT common_name) FROM detection
                WHERE station_id = $1
                AND detection_timestamp BETWEEN $2 AND $3
                ${filterClause}
            ) AS current_total_species,  
            (SELECT AVG(confidence) FROM detection 
                WHERE station_id = $1 
                AND detection_timestamp BETWEEN $2 AND $3 
                ${filterClause}
            ) AS current_confidence,
            (SELECT common_name FROM detection
                WHERE station_id = $1 
                AND detection_timestamp BETWEEN $2 AND $3 
                ${filterClause}
                GROUP BY common_name 
                ORDER BY COUNT(*) DESC 
                LIMIT 1
            ) AS current_top_species,

            (SELECT COUNT(*) FROM detection 
                WHERE station_id = $1 
                AND detection_timestamp BETWEEN $4 AND $5 
                ${filterClause}
            ) AS prev_total_detections,
            (SELECT COUNT(DISTINCT common_name) FROM detection 
                WHERE station_id = $1 AND detection_timestamp BETWEEN $4 AND $5 
                ${filterClause}
            ) AS prev_total_species,
            (SELECT AVG(confidence) FROM detection 
                WHERE station_id = $1 AND detection_timestamp BETWEEN $4 AND $5 
                ${filterClause}
            ) AS prev_confidence,
            (SELECT common_name FROM detection
                WHERE station_id = $1 
                AND detection_timestamp BETWEEN $4 AND $5 
                ${filterClause}
                GROUP BY common_name 
                ORDER BY COUNT(*) DESC 
                LIMIT 1
            ) AS previous_top_species
        `;

    const result = await db.query(sql, values);
    const data = result.rows[0];

    const totalDetectionsDelta = getDeltaValue(data.current_total_detections, data.prev_total_detections);
    const totalSpeciesDelta = getDeltaValue(data.current_total_species, data.prev_total_species);
    const confidenceDelta = getDeltaValue(data.current_confidence, data.prev_confidence);

    return {
        total_detections: {
            current: data.current_total_detections,
            delta: totalDetectionsDelta
        },
        total_species: {
            current: data.current_total_species,
            delta: totalSpeciesDelta
        },
        confidence: {
            current: data.current_confidence,
            delta: confidenceDelta
        },
        top_species: {
            current: data.current_top_species,
            previous: data.previous_top_species
        }
    };
}

// Helper function for calculating deltas
function getDeltaValue(current, previous) {
    if (previous === 0) return current; // Avoid division by zero
    return ((current - previous) / previous) * 100; // Percentage change
}

*/