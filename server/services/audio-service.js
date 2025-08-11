import db from "../config/db-conn.js";
import { getStationById } from "./station-service.js";
import axios from 'axios';

// Retrieves the filename and station ID for a given audio ID
export async function getAudioById(audioId) {
    const sql = `
        SELECT file_name, station.station_id
        FROM audio
        JOIN detection ON audio.audio_id = detection.audio_id
        JOIN station ON detection.station_id = station.station_id
        WHERE audio.audio_id = $1
    `;

    const result = await db.query(sql, [audioId]);

    return result.rows[0] || null;
}

// Sends request to fetch audio from a station and relays the stream
export async function relayAudioFromStation(stationId, path, filename) {
    const station = await getStationById(stationId);

    if (!station) {
        throw new Error(`Station with ID ${stationId} not found`);
    }

    const { station_host, station_port, api_key } = station;
    const url = `http://${station_host}:${station_port}/${path}/${filename}`;

    const response = await axios({
        method: "GET",
        url,
        headers: { 'Authorization': `Bearer ${api_key}` },
        responseType: 'stream'
    });

    return response;
}
