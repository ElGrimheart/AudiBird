import * as audioService from "../services/audio-service.js";
import logAction from "../utils/logger.js";

// GET /api/audio/:audioId route - retrieves audio by ID and relays the stream
export const getAudioById = async (req, res) => {
    const { audioId } = req.params;
  
    logAction("Retrieving audio by ID", { audioId });

    try {
        const { file_name, station_id } = await audioService.getAudioById(audioId);

        if (file_name) {
            const streamResponse = await audioService.relayAudioFromStation(station_id, "recordings", file_name);

            if (streamResponse) {
                // Setting response headers for audio streaming & piping stream to frontend
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