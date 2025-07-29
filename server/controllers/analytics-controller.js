import * as analyticsService from '../services/analytics-service.js';
import handleError from '../utils/errorHandler.js';
import logAction from '../utils/logger.js';


// GET /api/analytics/peak-hours/:stationId route - retrieves peak hours for a given station
export const getAverageDetectionWithinDates = async (req, res) => {
    const { stationId } = req.params;
    let { startDate, endDate } = req.query;
    logAction("Retrieving peak hours for", { stationId });

    startDate = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    endDate = endDate || new Date().toISOString();
  
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


