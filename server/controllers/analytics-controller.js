import * as analyticsService from '../services/analytics-service.js';
import handleError from '../utils/errorHandler.js';
import logAction from '../utils/logger.js';

// GET /api/analytics/average-hourly-trends/:stationId route - retrieves average hourly trends for a given station
export const getAverageHourlyTrendsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence } = req.query;

    logAction("Retrieving species hourly data for", { stationId } );

    try {
        const hourlyData = await analyticsService.getAverageHourlyTrendsByStationId(stationId, { startDate, endDate, speciesName, minConfidence });
        res.status(200).json({
            status: "success",
            message: `Retrieved species hourly data for Station ID: ${stationId}`,
            result: hourlyData
        });
    } catch (error) {
        handleError(res, error, `Error retrieving species hourly data for Station ID: ${stationId}`);
    }
};


// GET /api/analytics/species-summary/:stationId route - retrieves species summary for a given station
export const getSpeciesSummaryByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { speciesName } = req.query;
    logAction("Retrieving species summary for", { stationId });

    try {
        const speciesSummary = await analyticsService.getSpeciesSummaryByStationId(stationId, { speciesName });
        res.status(200).json({
            status: "success",
            message: `Retrieved species summary for Station ID: ${stationId}`,
            result: speciesSummary
        });
    } catch (error) {
        handleError(res, error, `Error retrieving species summary for Station ID: ${stationId}`);
    }
};


// GET /api/analytics/hourly-detection-totals/:stationId route - retrieves hourly detection totals for a given station
export const getHourlyDetectionTotalsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { singleDate, speciesName, minConfidence } = req.query;

    logAction("Retrieving hourly detection totals for", { stationId });

    try {
        const hourlyTotals = await analyticsService.getHourlyDetectionTotalsByStationId(stationId, { singleDate, speciesName, minConfidence });
        res.status(200).json({
            status: "success",
            message: `Retrieved hourly detection totals for Station ID: ${stationId}`,
            result: hourlyTotals
        });
    } catch (error) {
        handleError(res, error, `Error retrieving hourly detection totals for Station ID: ${stationId}`);
    }
};


// GET /api/analytics/daily-detection-totals/:stationId route - retrieves daily detection totals for a given station
export const getDailyDetectionTotalsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence } = req.query;

    logAction("Retrieving species trends for", { stationId });

    try {
        const trends = await analyticsService.getDailyDetectionTotalsByStationId(stationId, { startDate, endDate, speciesName, minConfidence });
        res.status(200).json({
            status: "success",
            message: `Retrieved species trends data for Station ID: ${stationId}`,
            result: trends
        });
    } catch (error) {
        handleError(res, error, `Error retrieving species trends data for Station ID: ${stationId}`);
    }
};