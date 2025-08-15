import * as analyticsService from '../services/analytics-service.js';
import logAction from '../utils/logger.js';


// GET /api/analytics/detection-summary/:stationId route - retrieves an overall summary of detections for a given station
export const getDetectionSummaryByStationId = async (req, res) => {
    const { stationId } = req.params;

    logAction("Retrieving detection summary for", { stationId });
    try {
        const detectionSummary = await analyticsService.getDetectionSummaryByStationId(stationId);
        if (detectionSummary) {
            res.status(200).json({
                status: "success",
                message: `Retrieved detection summary for Station ID: ${stationId}`,
                result: detectionSummary
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Detection summary for Station ID: ${stationId} not found`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving detection summary for Station ID: ${stationId}`,
            error: error.message
        });
    }
};

//GET /api/analytics/common-species/:stationId route - retrieve the most common species detected for a given station
export const getMostCommonSpeciesByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { limit } = req.query;

    logAction("Retrieving most common species for", { stationId });
    try {
        const mostCommonSpecies = await analyticsService.getMostCommonSpeciesByStationId(stationId, { limit });
        if (mostCommonSpecies) {
            res.status(200).json({
                status: "success",
                message: `Retrieved most common species for Station ID: ${stationId}`,
                result: mostCommonSpecies
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Most common species for Station ID: ${stationId} not found`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving most common species for Station ID: ${stationId}`,
            error: error.message
        });
    }
};

// GET /api/analytics/species-summary/:stationId route - retrieves species summary for a given station
export const getSpeciesSummaryByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { speciesName } = req.query;
    logAction("Retrieving species summary for", { stationId });

    try {
        const speciesSummary = await analyticsService.getSpeciesSummaryByStationId(stationId, { speciesName });
        
        if (speciesSummary) {
                res.status(200).json({
                status: "success",
                message: `Retrieved species summary for Station ID: ${stationId}`,
                result: speciesSummary
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Species summary for Station ID: ${stationId} not found`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving species summary for Station ID: ${stationId}`,
            error: error.message
        });
    }
};

// GET /api/analytics/average-hourly-trends/:stationId route - retrieves average hourly trends for a given station
export const getAverageHourlyTrendsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence } = req.query;

    logAction("Retrieving species hourly data for", { stationId } );

    try {
        const hourlyData = await analyticsService.getAverageHourlyTrendsByStationId(stationId, { startDate, endDate, speciesName, minConfidence });
        
        if (hourlyData) {
            res.status(200).json({
                status: "success",
                message: `Retrieved species hourly data for Station ID: ${stationId}`,
                result: hourlyData
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No hourly data found for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving species hourly data for Station ID: ${stationId}`,
            error: error.message
        });
    }
};

// GET /api/analytics/hourly-detection-totals/:stationId route - retrieves hourly detection totals for a given station
export const getHourlyDetectionTotalsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { singleDate, speciesName, minConfidence } = req.query;

    logAction("Retrieving hourly detection totals for", { stationId });

    try {
        const hourlyTotals = await analyticsService.getHourlyDetectionTotalsByStationId(stationId, { singleDate, speciesName, minConfidence });
        
        if (hourlyTotals) {
            res.status(200).json({
                status: "success",
                message: `Retrieved hourly detection totals for Station ID: ${stationId}`,
                result: hourlyTotals
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No hourly detection totals found for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving hourly detection totals for Station ID: ${stationId}`,
            error: error.message
        });
    }
};


// GET /api/analytics/daily-detection-totals/:stationId route - retrieves daily detection totals for a given station
export const getDailyDetectionTotalsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence } = req.query;

    logAction("Retrieving species trends for", { stationId });

    try {
        const dailyTotals = await analyticsService.getDailyDetectionTotalsByStationId(stationId, { startDate, endDate, speciesName, minConfidence });
        
        if (dailyTotals) {
            res.status(200).json({
                status: "success",
                message: `Retrieved daily totals for Station ID: ${stationId}`,
                result: dailyTotals
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No daily totals found for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving species trends data for Station ID: ${stationId}`,
            error: error.message
        });
    }
};