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