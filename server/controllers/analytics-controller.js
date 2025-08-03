import * as analyticsService from '../services/analytics-service.js';
import handleError from '../utils/errorHandler.js';
import logAction from '../utils/logger.js';


// GET /api/analytics/peak-hours/:stationId route - retrieves peak hours for a given station
export const getAverageDetectionWithinDates = async (req, res) => {
    const { stationId } = req.params;
    let { startDate, endDate } = req.query;
    logAction("Retrieving peak hours for", { stationId });
  
    try {
        const peakHours = await analyticsService.getAverageDetectionWithinDates(stationId, { startDate, endDate });
        res.status(200).json({
            status: "success",
            message: `Retrieved peak hours data for Station ID: ${stationId} between ${startDate} and ${endDate}`,
            result: peakHours
        });
    } catch (error) {
        handleError(res, error, `Error retrieving peak hours data for Station ID: ${stationId}`);
    }
}


// GET /api/analytics/species-hourly/:stationId route - retrieves hourly species data for a given station
export const getSpeciesHourlyTrends = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence } = req.query;

    logAction("Retrieving species hourly data for", { stationId });

    try {
        const hourlyData = await analyticsService.getSpeciesHourlyTrends(stationId, { startDate, endDate, speciesName, minConfidence });
        res.status(200).json({
            status: "success",
            message: `Retrieved species hourly data for Station ID: ${stationId}`,
            result: hourlyData
        });
    } catch (error) {
        handleError(res, error, `Error retrieving species hourly data for Station ID: ${stationId}`);
    }
};

// GET /api/analytics/species-trends/:stationId route - retrieves species trends for a given station
export const getSpeciesDailyTotals = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence } = req.query;
    logAction("Retrieving species trends for", { stationId });

    try {
        const trends = await analyticsService.getSpeciesDailyTotals(stationId, { startDate, endDate, speciesName, minConfidence });
        res.status(200).json({
            status: "success",
            message: `Retrieved species trends data for Station ID: ${stationId}`,
            result: trends
        });
    } catch (error) {
        handleError(res, error, `Error retrieving species trends data for Station ID: ${stationId}`);
    }
};

// GET /api/analytics/deltas/:stationId route - retrieves deltas for a given station
export const getDeltas = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence } = req.query;
    logAction("Retrieving deltas for", { stationId });

    try {
        const deltas = await analyticsService.getDeltas(stationId, { startDate, endDate, speciesName, minConfidence });
        res.status(200).json({
            status: "success",
            message: `Retrieved deltas data for Station ID: ${stationId} between ${startDate} and ${endDate}`,
            result: deltas
        });
    } catch (error) {
        handleError(res, error, `Error retrieving deltas data for Station ID: ${stationId}`);
    }
};

// GET /api/analytics/top-confidence/:stationId route - retrieves top confidence species for a given station
export const getTopConfidence = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, limit } = req.query;
    logAction("Retrieving top confidence species for", { stationId });

    try {
        const topConfidence = await analyticsService.getTopConfidence(stationId, { startDate, endDate, limit });
        res.status(200).json({
            status: "success",
            message: `Retrieved top confidence species data for Station ID: ${stationId}`,
            result: topConfidence
        });
    } catch (error) {
        handleError(res, error, `Error retrieving top confidence species data for Station ID: ${stationId}`);
    }
}