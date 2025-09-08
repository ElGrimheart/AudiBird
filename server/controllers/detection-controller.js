import * as detectionService from "../services/detection-service.js";
import * as stationService from "../services/station-service.js";
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
    const { limit } = req.query;

    logAction("Retrieving recent detections for", { stationId });

    try {
        const recentDetections = await detectionService.getRecentDetectionsByStationId(stationId, { limit });
        
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

// GET /api/detections/filtered/:stationId route - retrieves filtered detections for a given station
export const getFilteredDetectionsByStationId = async (req, res) => {
    const { stationId } = req.params;
    const { startDate, endDate, speciesName, minConfidence, maxConfidence, verificationStatusId, protectedAudio, limit, offset, sortOrder, sortBy } = req.query;
    logAction("Retrieving filtered detections for", { stationId, startDate, endDate, speciesName, minConfidence, maxConfidence, verificationStatusId, protectedAudio, limit, offset, sortOrder, sortBy });

    try {
        const queryResult = await detectionService.getFilteredDetectionsByStationId(stationId,{ startDate, endDate, speciesName, minConfidence, maxConfidence, verificationStatusId, protectedAudio, limit, offset, sortOrder, sortBy });
        if (queryResult) {
            res.status(200).json({
                status: "success",
                message: `Retrieved filtered detections data for Station ID: ${stationId}`,
                result: queryResult
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

// GET /api/detections/alternative-species/:detectionId route - retrieves alternative species for a given detection
export const getAlternativeSpeciesByDetectionId = async (req, res) => {
    const { detectionId } = req.params;

    logAction("Retrieving alternative species for", { detectionId });

    try {
        const alternativeSpecies = await detectionService.getAlternativeSpeciesByDetectionId(detectionId);

        if (alternativeSpecies && alternativeSpecies.length > 0) {
            res.status(200).json({
                status: "success",
                message: `Retrieved alternative species data for Detection ID: ${detectionId}`,
                result: alternativeSpecies
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No alternative species found for Detection ID: ${detectionId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving alternative species data for Detection ID: ${detectionId}`,
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

// PATCH /api/detections/:stationId/:detectionId/verify route - verifies a detection by its ID
export const verifyDetection = async (req, res) => {
    const { detectionId } = req.params;

    logAction("Verifying detection", detectionId);

    try {
        const verifiedDetection = await detectionService.verifyDetection(detectionId);

        if (verifiedDetection) {
            res.status(200).json({
                status: "success",
                message: `Detection ID: ${detectionId} verified successfully`,
                result: verifiedDetection
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No detection found for Detection ID: ${detectionId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error verifying Detection ID: ${detectionId}`,
            error: error.message
        });
    }
}

export const reclassifyDetection = async (req, res) => {
    const { detectionId } = req.params;
    const { alternativePredictionId } = req.body;

    logAction("Reclassifying detection", { detectionId, alternativePredictionId });

    try {
        const result = await detectionService.reclassifyDetection(detectionId, alternativePredictionId);

        if (result) {
            res.status(200).json({
                status: "success",
                message: `Detection ID: ${detectionId} reclassified successfully to Alternative Prediction ID: ${alternativePredictionId}`
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `No detection found for Detection ID: ${detectionId} or alternative prediction not found`
            });
        }
    } catch (error) {
        console.log("Error in reclassifyDetection:", error);
        res.status(500).json({
            status: "error",
            message: `Error reclassifying Detection ID: ${detectionId}`,
            error: error.message
        });
    }
}

// DELETE /api/detections/:stationId/:detectionId route - deletes a detection by its ID including associated audio file
export const deleteDetection = async (req, res) => {
    const { stationId, detectionId } = req.params;

    logAction("Deleting detection", detectionId);

    try {
        const { deletedDetection, deletedAudioFileName } = await detectionService.deleteDetection(detectionId);

        if (deletedDetection) {
            // Relay deletion to station to delete local copy
            if (deletedAudioFileName) {
                const stationResponse = await stationService.relayToStation(stationId, "delete-audio", "DELETE", { file_name: deletedAudioFileName });
                if (stationResponse.status === 200) {
                    res.status(200).json({
                        status: "success",
                        message: `Detection ID: ${detectionId} and audio file deleted successfully`
                    });
                }
            }
        } else {
            res.status(404).json({
                status: "failure",
                message: `No detection found for Detection ID: ${detectionId}`
            });
        }
    } catch (error) {
        if (error.message === "Audio protected") {
            console.log("Audio protected")
            return res.status(403).json({
                status: "failure",
                message: `Audio recording is protected. Cannot delete detection`
            });
        } else {
            res.status(500).json({
            status: "error",
            message: `Error deleting Detection ID: ${detectionId}`,
            error: error.message
            });
        }
    }
}