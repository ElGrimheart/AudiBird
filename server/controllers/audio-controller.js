import * as audioService from "../services/audio-service.js";
import logAction from "../utils/logger.js";

// GET /api/audio/:audioId route - retrieves the stationId, requests the audio stream from the station and relays to client
export const getAudioById = async (req, res) => {
    const { audioId } = req.params;
  
    logAction("Retrieving audio by ID", { audioId });

    try {
        // Fetch filename and stationId from the database
        const { file_name, station_id } = await audioService.getAudioById(audioId);

        if (file_name) {
            // Request the audio stream from the station and relay it to the client
            const streamResponse = await audioService.relayAudioFromStation(station_id, "recordings", file_name);

            if (streamResponse) {
                res.set(streamResponse.headers);
                streamResponse.data.pipe(res);
            } else {
                res.status(404).json({
                    status: "failure",
                    message: "Audio not found"
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving audio ID: ${audioId}`,
            error: error.message
        });
    }
};


// GET /api/audio/protected/:stationId route - retrieves protected audio filenames for a given station
export const getProtectedAudioByStationId = async (req, res) => {
    const { stationId } = req.params;

    logAction("Retrieving protected audio by station ID", { stationId });

    try {
        const protectedAudio = await audioService.getProtectedAudioByStationId(stationId);

        if (protectedAudio) {
            res.json({
                status: "success",
                result: protectedAudio
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: "No protected audio found for this station"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error retrieving protected audio for station ID: ${stationId}`,
            error: error.message
        });
    }
};


export const protectAudioById = async (req, res) => {
    const { audioId } = req.params;
    const { protectAudio } = req.body;

    logAction("Protecting audio by ID", { audioId });

    try {
        const result = await audioService.protectAudioById(audioId, protectAudio);

        if (result.rowCount > 0) {
            res.json({
                status: "success",
                message: "Audio protected successfully"
            });
        } else {
            res.status(404).json({
                status: "failure",
                message: "Audio not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Error protecting audio ID: ${audioId}`,
            error: error.message
        });
    }
};