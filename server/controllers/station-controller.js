import { io } from "../server.js";
import * as stationService from '../services/station-service.js';
import { generateDefaultStationConfig } from "../utils/stationConfigGenerator.js";
import logAction from "../utils/logger.js";
import { generateJwtToken } from "../utils/jwt.js";

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
        res.status(500).json({
            status: "error",
            message: `Error retrieving data for station ID: ${stationId}`,
            error: error.message
        });
    }
}

// GET /api/stations/config/:stationId route - retrieves the configuration for a specific station
export const getStationMetadataById = async (req, res) => {
    const { stationId } = req.params;
    const { authType } = req.authType;

    logAction("Retrieving station metadata", { stationId });

    try {
         if (authType === "API") {  // If the request is authenticated via API key, fetch only the configuration
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
        }

        // else, fetch the full metadata including date range and species list
        const metadata = await stationService.getStationMetadataById(stationId);
        if (metadata) {
            res.status(200).json({
                status: "success",
                message: `Retrieved metadata for Station ID: ${stationId}`,
                result: metadata
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Metadata for Station ID: ${stationId} not found`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving metadata for Station ID: ${stationId}`,
            error: error.message
        });
    }
}

// GET /api/stations/status/:stationId route - retrieves the status for a specific station
export const getStationStatusById = async (req, res) => {
    const { stationId } = req.params;
    
    logAction("Retrieving station status", { stationId });

    try {
        const stationStatus = await stationService.getStationStatusById(stationId);
        if (stationStatus) {
            res.status(200).json({
                status: "success",
                message: `Retrieved status for Station ID: ${stationId}`,
                result: stationStatus
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: `Status for Station ID: ${stationId} not found`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving status for Station ID: ${stationId}`,
            error: error.message
        });
    }
}

// POST /api/stations/:stationId route - creates a new station
export const createStation = async (req, res) => {
    const station_host = req.ip;
    const { station_name, station_port } = req.body;

    logAction("Creating station", { station_name });

    try {
        const newStation = await stationService.createStation(station_name, station_host, station_port);

        if (newStation) {
            const defaultConfig = generateDefaultStationConfig(newStation.station_id, newStation.api_key);
            console.log("Default Config:", defaultConfig);

            res.status(201).json({
                status: "success",
                message: "Station created successfully",
                result: defaultConfig
            });
        } else {
            res.status(400).json({
                status: "failure",
                message: "Failed to create station"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error creating station",
            error: error.message
        });
    }
}

// POST /api/stations/register/:stationId route - registers the station to a user and updates access permissions
export const registerStation = async (req, res) => {
    const userId = req.user.userId;
    const {stationId, stationApiKey} = req.body;

    logAction("Registering station", { stationId, userId });

    try {
        const result = await stationService.registerStationToUser(userId, stationId, stationApiKey);
        if (result) {

            const stationResponse = await stationService.relayToStation(stationId, 'claim', 'POST');
            if (stationResponse.status === 200) {
                // Update users JWT
                const token = await generateJwtToken(userId);
                res.status(200).json({
                    status: "success",
                    message: `Station ID: ${stationId} registered to User ID: ${userId}`,
                    result: {
                        jwt: token
                    }
                });
            } else {
                await stationService.removeUserFromStation(userId, stationId);
                res.status(400).json({
                    status: "failure",
                    message: `Failed to connect to station ${stationId}`
                });
            }
        } else {
            res.status(404).json({
                status: "failure",
                message: `Failed to register Station ID: ${stationId} to User ID: ${userId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error registering Station ID: ${stationId} to User ID: ${userId}`,
            error: error.message
        });
    }
}

// POST /api/stations/config/:stationId route - updates the config of the specified station
export const updateStationConfigById = async (req, res) => {
    const { stationId } = req.params;
    const configData = req.body;

    logAction("Updating station config", { stationId, configData });

    try {
        const new_config = await stationService.updateStationConfig(stationId, configData);
        console.log("New Config:", new_config);

        if (new_config) {

            const stationResponse = await stationService.relayToStation(stationId, 'update-config', 'POST', new_config);
            if (stationResponse.status === 200) {
                res.status(200).json({
                    status: "success",
                    message: `Config for Station ID: ${stationId} updated successfully`,
                    result: new_config
                });
            } else {
                res.status(400).json({
                    status: "failure",
                    message: `Failed to connect to station ${stationId}`
                });
            }
        } else {
            res.status(400).json({
                status: "failure",
                message: `Failed to update config for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error updating config for Station ID: ${stationId}`,
            error: error.message
        });
    }
}

// POST /api/stations/status/:stationId route - updates the status for a specific station
export const createStationStatus = async (req, res) => {
    const { stationId } = req.params;
    const statusData = req.body;

    //logAction("Updating station status", { stationId, statusData });

    try {
        const updatedStatus = await stationService.createStationStatus(stationId, statusData);

        if (updatedStatus) {
            // Emit a socket event to notify clients of the status update
            io.to(stationId).emit("statusUpdate", updatedStatus);

            res.status(201).json({
                status: "success",
                message: `Status for Station ID: ${stationId} updated successfully`,
                result: updatedStatus
            });
        } else {
            res.status(400).json({
                status: "failure",
                message: `Failed to update status for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error updating status for Station ID: ${stationId}`,
            error: error.message
        });
    }
}


// POST /api/stations/start-recording/:stationId route - starts recording for a specific station
export const startStationRecording = async (req, res) => {
    const { stationId } = req.params;

    logAction("Starting station recording", { stationId });

    try {
        const response = await stationService.relayToStation(stationId, 'start', 'POST');
        console.log("Start Recording Response:", response);

        if (response.status === 200) {
            // Emit a socket event to notify clients of the recording status
            io.to(stationId).emit("recordingStatus", { isRecording: true });

            res.status(200).json({
                status: "success",
                message: `Recording started for Station ID: ${stationId}`
            });
        } else {
            res.status(400).json({
                status: "failure",
                message: `Failed to start recording for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error starting recording for Station ID: ${stationId}`,
            error: error.message
        });
    }
}

// POST /api/stations/stop-recording/:stationId route - stops recording for a specific station
export const stopStationRecording = async (req, res) => {
    const { stationId } = req.params;

    logAction("Stopping station recording", { stationId });

    try {
        const response = await stationService.relayToStation(stationId, 'stop', 'POST');
        console.log("Stop Recording Response:", response);

        if (response.status === 200) {
            // Emit a socket event to notify clients of the recording status
            io.to(stationId).emit("recordingStatus", { isRecording: false });

            res.status(200).json({
                status: "success",
                message: `Recording stopped for Station ID: ${stationId}`
            });
        } else {
            res.status(400).json({
                status: "failure",
                message: `Failed to stop recording for Station ID: ${stationId}`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error stopping recording for Station ID: ${stationId}`,
            error: error.message
        });
    }
}