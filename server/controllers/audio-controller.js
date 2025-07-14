import * as audioService from "../services/audio-service.js";
import logAction from "../utils/logger.js";

// GET /api/audio/:audioId route - retrieves audio by ID
export const getAudioById = async (req, res) => {
    const { audioId } = req.params;
  
    logAction("Retrieving audio by ID", { audioId });

    try {
        const streamResponse = await audioService.getAudioById(audioId, req.headers.range);

        // Setting response headers for audio streaming & piping stream to frontend
        res.set(streamResponse.headers);
        streamResponse.data.pipe(res);
    } catch (err) {
        if (err.message === "Audio not found") {
            res.status(404).json({ error: "Audio not found" });
        } else {
            res.status(502).json({ error: "Failed to stream audio from station." });
        }
    }
};