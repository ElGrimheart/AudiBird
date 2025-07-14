import { io } from "../server.js";
import * as detectionService from "../services/detection-service.js";
import handleError from "../utils/errorHandler.js";
import logAction from "../utils/logger.js";

// GET /api/:stationId/detections/:detectionId route - retrieves a specific detection by ID
export const getDetectionById = async (req, res) => {
    const { stationId, detectionId } = req.params;
    
    logAction("Retrieving detection", { stationId, detectionId });

    try {
        const detection = await detectionService.getDetectionById(stationId, detectionId);
        if (detection) {
            res.status(200).json({
                status: "success",
                message: `Detection ID: ${detectionId} retrieved`,
                result: detection
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Detection ID: ${detectionId} not found`
            });
        }
    } catch (err) {
        handleError(res, err, `Error retrieving detection for ID: ${detectionId}`);
    }
};

// GET /api/:stationId/detections/all route - retrieves all detections for a given station
export const getAllDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    logAction("Retrieving all detections for", { stationId });

    try {
        const detections = await detectionService.getAllDetectionsByStationId(stationId);
        res.status(200).json({
            status: "success",
            message: `All detections for Station ID: ${stationId} retrieved`,
            result: detections
        });
    } catch (err) {
        handleError(res, err, `Error retrieving detection for Station ID: ${stationId}`);
    }
};

// GET /api/:stationId/detections/recent route - retrieves 10 most recent detections for a given station
export const getRecentDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    logAction("Retrieving recent detections for", { stationId });

    try {
        const recentDetections = await detectionService.getRecentDetectionsByStationId(stationId);
        res.status(200).json({
            status: "success",
            message: `Recent detections for Station ID: ${stationId} retrieved`,
            result: recentDetections
        });
    } catch (err) {
        handleError(res, err, `Error retrieving recent detections for Station ID: ${stationId}`);
    }
};

// GET /api/:stationId/detections/common route - retrieves the most common species detected at a given station
export const getMostCommonSpeciesByStationId = async (req, res) => {
    const { stationId } = req.params;
    logAction("Retrieving most common species for", { stationId });

    try {
        const commonSpecies = await detectionService.getMostCommonSpeciesByStationId(stationId);
        res.status(200).json({
            status: "success",
            message: `Most common species for Station ID: ${stationId} retrieved`,
            result: commonSpecies
        });
    } catch (err) {
        handleError(res, err, `Error retrieving common species for Station ID: ${stationId}`);
    }
}

// GET /api/:stationId/detections/summary route - retrieves a summary of detections for a given station
export const getDetectionSummaryByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { from, to, species } = req.query;
    logAction("Retrieving detection summary for", { stationId, from, to, species });

    try {
        const detectionSummary = await detectionService.getDetectionSummaryByStationId(stationId, { from, to, species });
        res.status(200).json({
            status: "success",
            message: `Detection summary for Station ID: ${stationId} retrieved`,
            result: detectionSummary
        });
    } catch (error) {
        handleError(res, err, `Error retrieving detection summary for Station ID: ${stationId}`);
    }
};

// GET /api/:stationId/detections/?filters route - retrieves detections for a given station with various filters
export const getFilteredDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { from, to, species, min_confidence, max_confidence, limit, offset, sort, sort_by} = req.query;
    logAction("Retrieving filtered detections for", { stationId, from, to, species, min_confidence, max_confidence, limit, offset, sort, sort_by });

    try {
        const filteredDetections = await detectionService.getFilteredDetectionsByStationId(stationId,{ from, to, species, min_confidence, max_confidence, limit, offset, sort, sort_by });
        res.status(200).json({
            status: "success",
            message: `${filteredDetections.length} records retrieved`,
            result: filteredDetections
        });
    } catch (err) {
        handleError(res, err, `Error retrieving filtered detections for Station ID: ${stationId}`);
    };
}

// POST /api/:stationId/detections route - creates a new detection for a given station
export const createDetection = async (req, res) => {
    const { stationId } = req.params;
    const detectionData = req.body;

    logAction("Creating new detection for", { stationId, detectionData });

    try {
        const newDetection = await detectionService.createDetection(stationId, detectionData);

        // Emit a socket event to notify clients of the new detection
        io.emit("newDetection", newDetection);

        res.status(201).json({
            status: "success",
            message: `New detection created for Station ID: ${stationId}`,
            result: newDetection
        });
    } catch (err) {
        handleError(res, err, `Error creating detection for Station ID: ${stationId}`);
    }
};