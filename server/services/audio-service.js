import db from "../config/db-conn.js";
import axios from 'axios';

export async function getAudioById(audioId, rangeHeader) {
    const sql = `
        SELECT file_path
        FROM audio
        WHERE audio_id = $1
    `;

    const result = await db.query(sql, [audioId]);
    
    if (result.rowCount === 0) {
        throw new Error('Audio not found');
    }

    // return the audio stream
    const { file_path } = result.rows[0];
    const stationUrl = `http://192.168.0.47:4000/recordings/${file_path}`;

    const streamResponse = await axios.get(stationUrl, {
        responseType: "stream",
        headers: rangeHeader ? { Range: rangeHeader } : {}
    });

    return streamResponse;
}
