import * as detectionService from "../services/detection-service.js";
import logAction from "../utils/logger.js";

// GET /api/detections/:detectionId route - retrieves a detection by its ID
export const getDetectionById = async (req, res) => {
    const { detectionId } = req.params;
    
    logAction("Retrieving detection", { detectionId });

    try {
        const detection = await detectionService.getDetectionById(detectionId);
        if (detection) {
            res.status(200).json({
                status: "success",
                message: `Retrieved detection ID: ${detectionId}`,
                result: detection
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Detection ID: ${detectionId} not found`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving detection ID: ${detectionId}`,
            error: error.message
        });
    }
};

// GET /api/detections/all/:stationId route - retrieves all detections for a given station
export const getAllDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    logAction("Retrieving all detections for", { stationId });

    try {
        const detections = await detectionService.getAllDetectionsByStationId(stationId);
        
        if (detections && detections.length > 0) {
            res.status(200).json({
                status: "success",
                message: `${detections.length} detections retrieved for Station ID: ${stationId}`,
                result: detections
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No detections found for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving all detections for Station ID: ${stationId}`,
            error: error.message
        });
    }
};

// GET /api/detections/recent/:stationId route - retrieves recent detections for a given station
export const getRecentDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    logAction("Retrieving recent detections for", { stationId });

    try {
        const recentDetections = await detectionService.getRecentDetectionsByStationId(stationId);
        
        if (recentDetections && recentDetections.length > 0) {
            res.status(200).json({
                status: "success",
                message: `Retrieved recent detections data for Station ID: ${stationId}`,
                result: recentDetections
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No recent detections found for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving recent detections data for Station ID: ${stationId}`,
            error: error.message
        });
    }
};

// GET /api/detections/common/:stationId route - retrieves the most common species detected for a given station
export const getMostCommonSpeciesByStationId = async (req, res) => {
    const { stationId } = req.params;
    logAction("Retrieving most common species for", { stationId });

    try {
        const commonSpecies = await detectionService.getMostCommonSpeciesByStationId(stationId);
        
        if (commonSpecies && commonSpecies.length > 0) {
            res.status(200).json({
                status: "success",
                message: `Retrieved most common species data for Station ID: ${stationId}`,
                result: commonSpecies
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No common species found for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving most common species data for Station ID: ${stationId}`,
            error: error.message
        });
    }
}

// GET /api/detections/summary/:stationId route - retrieves a summary of detections for a given station
export const getDetectionSummaryByStationId = async (req, res) => {
    const { stationId } = req.params;
    logAction("Retrieving detection summary for", { stationId });

    try {
        const detectionSummary = await detectionService.getDetectionSummaryByStationId(stationId);

        if (detectionSummary) {
            res.status(200).json({
                status: "success",
                message: `Retrieved detection summary data for Station ID: ${stationId}`,
                result: detectionSummary
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No detection summary found for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving detection summary data for Station ID: ${stationId}`,
            error: error.message
        });
    }
};

// GET /api/detections/filtered/:stationId route - retrieves filtered detections for a given station
export const getFilteredDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence, maxConfidence, limit, offset, sortOrder, sortBy } = req.query;
    logAction("Retrieving filtered detections for", { stationId, startDate, endDate, speciesName, minConfidence, maxConfidence, limit, offset, sortOrder, sortBy });

    try {
        const filteredDetections = await detectionService.getFilteredDetectionsByStationId(stationId,{ startDate, endDate, speciesName, minConfidence, maxConfidence, limit, offset, sortOrder, sortBy });
        
        if (filteredDetections && filteredDetections.length > 0) {
            res.status(200).json({
                status: "success",
                message: `Retrieved filtered detections data for Station ID: ${stationId}`,
                result: filteredDetections
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No filtered detections found for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving filtered detections data for Station ID: ${stationId}`,
            error: error.message
        });
    }
};

// POST /api/detections/new/:stationId route - creates a new detection for a given station
export const createDetection = async (req, res) => {
    const { stationId } = req.params;
    const detectionData = req.body;

    logAction("Creating new detection for", { stationId, detectionData });

    try {
        const newDetection = await detectionService.createDetection(stationId, detectionData);

        if (newDetection) {
            res.status(201).json({
                status: "success",
                message: `New detection created with ID: ${newDetection.detection_id}`,
                result: newDetection
            });
        } else {
            res.status(400).json({
                status: "failure",
                message: `Failed to create detection for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error creating detection for Station ID: ${stationId}`,
            error: error.message
        });
    }
};