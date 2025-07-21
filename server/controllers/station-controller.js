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
                message: `Retrieved Station ID: ${stationId} data`,
                result: station
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Station ID: ${stationId} not found`
            });
        }
    } catch (error) {
        handleError(res, error, `Error retrieving data for station ID: ${stationId}`);
    }
}

// GET /api/stations/status/:stationId route - retrieves the status for a specific station
export const getStationStatusById = async (req, res) => {
    const { stationId } = req.params;
    
    logAction("Retrieving station status", { stationId });

    try {
        const status = await stationService.getStationStatusById(stationId);
        if (status) {
            res.status(200).json({
                status: "success",
                message: `Retrieved status for Station ID: ${stationId}`,
                result: status
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Status for Station ID: ${stationId} not found`
            });
        }
    } catch (error) {
        handleError(res, error, `Error retrieving status for Station ID: ${stationId}`);
    }
}

// GET /api/stations/config/:stationId route - retrieves the configuration for a specific station
export const getStationConfigById = async (req, res) => {
    const { stationId } = req.params;
    
    logAction("Retrieving station config", { stationId });

    try {
        const config = await stationService.getStationConfigById(stationId);
        if (config) {
            res.status(200).json({
                status: "success",
                message: `Retrieved configuration for Station ID: ${stationId}`,
                result: config
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Configuration for Station ID: ${stationId} not found`
            });
        }
    } catch (error) {
        handleError(res, error, `Error retrieving configuration for Station ID: ${stationId}`);
    }
}

// POST /api/stations/:stationId route - creates a new station
export const createStation = async (req, res) => {
    const stationData = req.body;

    logAction("Creating station", { stationData });

    try {
        const newStation = await stationService.createStation(stationData);
        res.status(201).json({
            status: "success",
            message: "Station created successfully",
            result: newStation
        });
    } catch (error) {
        handleError(res, error, "Error creating station");
    }
}

// POST /api/stations/status/:stationId route - updates the status for a specific station
export const createStationStatusById = async (req, res) => {
    const { stationId } = req.params;
    const statusData = req.body;

    logAction("Updating station status", { stationId, statusData });

    try {
        const updatedStatus = await stationService.createStationStatusById(stationId, statusData);
        res.status(200).json({
            status: "success",
            message: `Status for Station ID: ${stationId} updated successfully`,
            result: updatedStatus
        });
    } catch (error) {
        handleError(res, error, `Error updating status for Station ID: ${stationId}`);
    }
}

// POST /api/stations/config/:stationId route - updates the configuration for a specific station
export const updateStationConfigById = async (req, res) => {
    const { stationId } = req.params;
    const configData = req.body;

    logAction("Updating station config", { stationId, configData });

    try {
        const updatedConfig = await stationService.updateStationConfigById(stationId, configData);
        res.status(200).json({
            status: "success",
            message: `Configuration for Station ID: ${stationId} updated successfully`,
            result: updatedConfig
        });
    } catch (error) {
        handleError(res, error, `Error updating configuration for Station ID: ${stationId}`);
    }
}