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


// GET /api/analytics/species-trends/:stationId route - retrieves species trends for a given station
export const getSpeciesTrends = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence } = req.query;
    logAction("Retrieving species trends for", { stationId });

    try {
        const trends = await analyticsService.getSpeciesTrends(stationId, { startDate, endDate, speciesName, minConfidence });
        res.status(200).json({
            status: "success",
            message: `Retrieved species trends data for Station ID: ${stationId}`,
            result: trends
        });
    } catch (error) {
        handleError(res, error, `Error retrieving species trends data for Station ID: ${stationId}`);
    }
};

// GET /api/analytics/species-composition/:stationId route - retrieves species composition for a given station
export const getSpeciesComposition = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, minConfidence } = req.query;
    logAction("Retrieving species composition for", { stationId });

    try {
        const composition = await analyticsService.getSpeciesComposition(stationId, { startDate, endDate, minConfidence });
        res.status(200).json({
            status: "success",
            message: `Retrieved species composition data for Station ID: ${stationId}`,
            result: composition
        });
    } catch (error) {
        handleError(res, error, `Error retrieving species composition data for Station ID: ${stationId}`);
    }
};

