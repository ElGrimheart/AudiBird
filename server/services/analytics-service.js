import db from "../config/db-conn.js";
import { normaliseDateToStartOfDay, normaliseDateToEndOfDay } from "../utils/date-formatter.js";
import { buildDetectionWhereClause } from "../utils/sql-builder.js";

/*
Retrieves an overall summary of detections for a given station ID
Returns an object containing total detections, total species, detections today, species today, 
detections last hour, species last hour
*/
export async function getDetectionSummaryByStationId(stationId) {
    const sql = `
        SELECT
            COUNT(*) AS total_detections,
            COUNT(DISTINCT common_name) AS total_species,
            COUNT(*) FILTER (WHERE detection_timestamp >= CURRENT_DATE) AS detections_today,
            COUNT(DISTINCT common_name) FILTER (WHERE detection_timestamp >= CURRENT_DATE) AS species_today,
            COUNT(*) FILTER (WHERE detection_timestamp >= NOW() - INTERVAL '1 hour') AS detections_last_hour,
            COUNT(DISTINCT common_name) FILTER (WHERE detection_timestamp >= NOW() - INTERVAL '1 hour') AS species_last_hour
        FROM detection
        WHERE station_id = $1
    `;
    const result = await db.query(sql, [stationId]);
    return result.rows[0];
}


/*
Retrieves the N most common species detected for a given station ID
Returns an array of objects containing common name, scientific name, species code, image URL, image rights, and count.
*/
export async function getMostCommonSpeciesByStationId(stationId, { limit }) {
    const sql = `
        SELECT 
            detection.common_name, 
            detection.scientific_name, 
            detection.species_code, 
            species_media.image_url, 
            species_media.image_rights, 
            COUNT(*) as count
        FROM detection
        LEFT JOIN species_media ON detection.species_code = species_media.species_code
        WHERE detection.station_id = $1
        GROUP BY detection.common_name, detection.scientific_name, detection.species_code, species_media.image_url, species_media.image_rights
        ORDER BY count DESC
        LIMIT $2
    `;

    const result = await db.query(sql, [stationId, limit]);
    return result.rows;
}

/*
Generates a species summary for a given station ID.
Returns an object containing total detections, first/last detection timestamps, peak detection day, and average detections per day.
*/
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
            (SELECT day::date FROM daily_counts ORDER BY total DESC LIMIT 1) AS peak_day,
            (SELECT total FROM daily_counts ORDER BY total DESC LIMIT 1) AS peak_count,
            ROUND(AVG(total), 2) AS average_detections_per_day,
            (SELECT image_url FROM species_media WHERE species_code = (SELECT species_code FROM detection ${whereClause} LIMIT 1)) AS image_url,
            (SELECT image_rights FROM species_media WHERE species_code = (SELECT species_code FROM detection ${whereClause} LIMIT 1)) AS image_rights,
            (SELECT species_code FROM detection ${whereClause} LIMIT 1) AS species_code
        FROM daily_counts
    `;

    const result = await db.query(sql, values);
    console.log("Species Summary Result:", result.rows);
    return result.rows[0];
}

/* 
Generates average hourly trends of detections for a given station.
Returns an array of objects with hour and average_detections properties.
Filterable by date range, species name, and minimum confidence level.
*/
export async function getAverageHourlyTrendsByStationId(stationId, { startDate, endDate, speciesName, minConfidence }) {

    // Normalize times to start and end of the day
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

    // Construct full result
    const fullResult = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        average_detections: hoursMap[hour] ?? 0
    }));

    return fullResult;
}

/*
Generates hourly detection totals for each species for a given station.
Returns an array of objects with hour, common_name, and count properties.
Filterable by a single date, species name, and minimum confidence level.
If no filters are provided, defaults to all species detections for current date
*/
export async function getHourlyDetectionTotalsByStationId(stationId, { singleDate, speciesName, minConfidence }) {

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

    // Construct full result
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
    
    // Normalize dates to start and end of the day
    startDate = normaliseDateToStartOfDay(startDate);
    endDate = normaliseDateToEndOfDay(endDate);

    const filters = {startDate, endDate, speciesName, minConfidence};
    const { whereClause, values } = buildDetectionWhereClause(stationId, filters);

    const sql = `
        SELECT 
            TO_CHAR(detection_timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date, 
            common_name, 
            COUNT(*) AS count
        FROM detection
        ${whereClause}
        GROUP BY date, common_name
        ORDER BY date;
    `;

    const result = await db.query(sql, values);

    // Extract all unique species from the result
    const speciesList = Array.from(new Set(result.rows.map(row => row.common_name)));

    // Build date-species : count map
    const countMap = {};
    result.rows.forEach(row => {
        const date = row.date; 
        countMap[`${date}|${row.common_name}`] = Number(row.count);
    });

    // Get all dates in range (accounts for dates where no detections occurred)
    const allDates = getAllDatesInRange(startDate, endDate);

    // Construct full result
    const fullResult = [];
    allDates.forEach(date => {
        speciesList.forEach(speciesName => {
            fullResult.push({
                date: date,
                common_name: speciesName,
                count: countMap[`${date}|${speciesName}`] || 0
            });
        });
    });

    return fullResult;
}

/*
Generates a daily summary for a specific station on a given date.
Returns an object containing total detections, total species, common species, and new species for the date passed
*/
export async function getDailySummaryByStationId(stationId, singleDate) {
    try {
        const dailyDetections = await getTotalDetectionsByStationId(stationId, { startDate: singleDate, endDate: singleDate });
        const dailySpecies = await getTotalSpeciesByStationId(stationId, { startDate: singleDate, endDate: singleDate });
        const commonSpecies = await getCommonSpeciesByStationId(stationId, { startDate: singleDate, endDate: singleDate });
        const newSpecies = await getNewSpeciesByStationId(stationId, singleDate);

        return {dailyDetections, dailySpecies, commonSpecies, newSpecies};
    } catch (error) {
        console.error("Error in getDailySummaryByStationId:", error);
    }   
    return null;
}



////// Helper functions for main analytics services //////////////

// Returns all the dates in a given range
function getAllDatesInRange(startDate, endDate) {
    // Ensure dates are in YYYY-MM-DD format and create Date objects
    const start = new Date(String(startDate).slice(0, 10) + 'T00:00:00Z');
    const end = new Date(String(endDate).slice(0, 10) + 'T00:00:00Z');

    // loop through each date and construct date array
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
        const yyyy = current.getUTCFullYear();
        const mm = String(current.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(current.getUTCDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return dates;
}

// Returns the total detections for a given station and date range
async function getTotalDetectionsByStationId(stationId, { startDate, endDate }) {
    startDate = normaliseDateToStartOfDay(startDate);
    endDate = normaliseDateToEndOfDay(endDate);
    const { whereClause, values } = buildDetectionWhereClause(stationId, { startDate, endDate });

    const sql = `
        SELECT COUNT(*) AS total_detections
        FROM detection
        ${whereClause}
    `;

    const result = await db.query(sql, values);
    return result.rows[0].total_detections || 0;
}

// Returns the total species for a given station and date range
async function getTotalSpeciesByStationId(stationId, { startDate, endDate }) {
    startDate = normaliseDateToStartOfDay(startDate);
    endDate = normaliseDateToEndOfDay(endDate);
    const { whereClause, values } = buildDetectionWhereClause(stationId, { startDate, endDate });

    const sql = `
        SELECT COUNT(DISTINCT common_name) AS total_species
        FROM detection
        ${whereClause}
    `;

    const result = await db.query(sql, values);
    return result.rows[0].total_species || 0;
}

// Returns the common species for a given station and date range
async function getCommonSpeciesByStationId(stationId, { startDate, endDate }) {
    startDate = normaliseDateToStartOfDay(startDate);
    endDate = normaliseDateToEndOfDay(endDate);
    const { whereClause, values } = buildDetectionWhereClause(stationId, { startDate, endDate });

    const sql = `
        SELECT common_name, COUNT(*) AS count
        FROM detection
        ${whereClause}
        GROUP BY common_name
        ORDER BY count DESC
        LIMIT 5
    `;

    const result = await db.query(sql, values);
    return result.rows || [];
}

// Get new species detected for a given station and date
async function getNewSpeciesByStationId(stationId, singleDate) {
    singleDate = singleDate || new Date(Date.now()).toISOString();
    
    const sql = `
       SELECT DISTINCT detection1.common_name
        FROM detection detection1
        WHERE detection1.station_id = $1
        AND DATE(detection1.detection_timestamp) = $2
        AND NOT EXISTS (
            SELECT 1 FROM detection detection2
            WHERE detection2.station_id = $1
                AND detection2.common_name = detection1.common_name
                AND DATE(detection2.detection_timestamp) < $2
        );
    `;

    const result = await db.query(sql, [stationId, singleDate]);
    return result.rows || [];
}