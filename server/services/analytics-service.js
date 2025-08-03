import db from "../config/db-conn.js";
import { normaliseDateToStartOfDay, normaliseDateToEndOfDay } from "../utils/dateFormatter.js";
import { buildDetectionWhereClause, buildDeltaFilters } from "../utils/sqlBuilder.js";
import logAction from "../utils/logger.js";
import handleError from "../utils/errorHandler.js";

// Retrieves the average detections within a date range for a given station ID
export async function getAverageDetectionWithinDates(stationId, { startDate, endDate }) {
    
    // Default to the last 7 days if no dates are provided
    startDate = startDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    endDate = endDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Normalize dates to start and end of the day
    startDate = normaliseDateToStartOfDay(new Date(startDate));
    endDate = normaliseDateToEndOfDay(new Date(endDate));

    const filters = { stationId, startDate, endDate };
    const { whereClause, values } = buildDetectionWhereClause(stationId, filters);

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
            ${whereClause}
            GROUP BY hour, hour_of_day
        ) AS hourly_counts
        GROUP BY hour_of_day
        ORDER BY hour_of_day
    `;

    const result = await db.query(sql, values);
    
    // Apply default values for hours with no detections
    const hoursMap = {};
    result.rows.forEach(row => {
        hoursMap[row.hour_of_day] = Number(row.average_detections);
    });
    const fullResult = Array.from({ length: 24 }, (_, hour) => ({
        hour: hour,
        average_detections: hoursMap[hour] ?? 0
    }));

    return fullResult;
}

// Retrieves hourly species data for a given station ID
export async function getSpeciesHourlyTrends(stationId, { startDate, endDate, speciesName, minConfidence }) {
    // Default to the last 7 days if no dates are provided
    startDate = startDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    endDate = endDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Normalize dates to start and end of the day
    startDate = normaliseDateToStartOfDay(new Date(startDate));
    endDate = normaliseDateToEndOfDay(new Date(endDate));

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

    // Apply default values for hours with no detections
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


// Retrieves species daily total detections for a given station ID
export async function getSpeciesDailyTotals(stationId, { startDate, endDate, speciesName, minConfidence }) {
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


// Retrieves the top species by confidence for a given station ID
export async function getTopConfidence(stationId, { startDate, endDate, limit}) {
    // Default to the last 7 days if no dates are provided
    startDate = startDate || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    endDate = endDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Normalize dates to start and end of the day
    startDate = normaliseDateToStartOfDay(new Date(startDate));
    endDate = normaliseDateToEndOfDay(new Date(endDate));

    const values = [stationId, startDate, endDate, limit || 5];

    const sql = `
        SELECT common_name, ROUND(AVG(confidence), 2) AS avg_confidence, COUNT(*) AS total_detections, image_url, image_rights
        FROM detection
        LEFT OUTER JOIN species_media ON detection.species_code = species_media.species_code
        WHERE station_id = $1
        AND detection_timestamp BETWEEN $2 AND $3
        GROUP BY common_name, image_url, image_rights
        ORDER BY avg_confidence DESC
        LIMIT $4;
    `;

    const result = await db.query(sql, values);
    
    return result.rows;
}