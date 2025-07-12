import express from 'express';
import axios from 'axios';
import db from "../../config/db-conn.js";

const audiorouter = express.Router();

// Example: GET /api/audio/:audioId
audiorouter.get('/:audioId', async (req, res) => {
  const { audioId } = req.params;
  console.log(`Fetching audio for ID: ${audioId}`);

  try {
    // Step 1: Look up audio file and station info
    const result = await db.query(`
      SELECT file_path
      FROM audio
      WHERE audio_id = $1
    `, [audioId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    const { file_path } = result.rows[0];

    // Step 2: Build URL to fetch audio from Pi Flask server
    const piUrl = `http://192.168.0.37:4000/recordings/${file_path}`;
    console.log(`Forwarding request to Pi at: ${piUrl}`);

    // Step 3: Stream audio from Pi and forward it
    const streamResponse = await axios.get(piUrl, {
      responseType: 'stream',
      headers: {
        // Forward range header for seeking
        ...(req.headers.range && { Range: req.headers.range })
      }
    });

    // Set response headers (especially for audio playback)
    res.set(streamResponse.headers);

    // Pipe the stream to the frontend
    streamResponse.data.pipe(res);

  } catch (error) {
    console.error('Audio proxy error:', error.message);
    res.status(502).json({ error: 'Failed to stream audio from station.' });
  }
});

export default audiorouter;