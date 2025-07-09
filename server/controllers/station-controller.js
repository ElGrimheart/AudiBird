import * as stationService from '../services/station-service.js';
import handleError from "../utils/errorHandler.js";
import logAction from "../utils/logger.js";


// GET /api/stations/:stationId route - retrieves a specific station by ID
export const getStationById = async (req, res) => {
    const { stationId } = req.params;
    
    logAction("Retrieving station", { stationId });

    try {
        const station = await stationService.getStationById(stationId);
        if (station) {
            res.status(200).json({
                status: "success",
                message: `Station ID: ${stationId} retrieved`,
                result: station
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Station ID: ${stationId} not found`
            });
        }
    } catch (err) {
        handleError(res, err, `Error retrieving station for ID: ${stationId}`);
    }
}

// GET /api/stations/:stationId/config route - retrieves the configuration for a specific station
export const getStationConfigById = async (req, res) => {
    const { stationId } = req.params;
    
    logAction("Retrieving station config", { stationId });

    try {
        const config = await stationService.getStationConfigById(stationId);
        if (config) {
            res.status(200).json({
                status: "success",
                message: `Configuration for Station ID: ${stationId} retrieved`,
                result: config
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Configuration for Station ID: ${stationId} not found`
            });
        }
    } catch (err) {
        handleError(res, err, `Error retrieving configuration for Station ID: ${stationId}`);
    }
}

// GET /api/stations/:stationId/status route - retrieves the status for a specific station
export const getStationStatusById = async (req, res) => {
    const { stationId } = req.params;
    
    logAction("Retrieving station status", { stationId });

    try {
        const status = await stationService.getStationStatusById(stationId);
        if (status) {
            res.status(200).json({
                status: "success",
                message: `Status for Station ID: ${stationId} retrieved`,
                result: status
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Status for Station ID: ${stationId} not found`
            });
        }
    } catch (err) {
        handleError(res, err, `Error retrieving status for Station ID: ${stationId}`);
    }
}

// POST /api/stations/:stationId/status route - creates a new status log for a specific station
export const createStationStatusById = async (req, res) => {
    const { stationId } = req.params;
    const statusData = req.body;

    logAction("Updating station status", { stationId, statusData });

    try {
        const updatedStatus = await stationService.createStationStatusById(stationId, statusData);
        res.status(200).json({
            status: "success",
            message: `Status for Station ID: ${stationId} updated`,
            result: updatedStatus
        });
    } catch (err) {
        handleError(res, err, `Error updating status for Station ID: ${stationId}`);
    }
}
