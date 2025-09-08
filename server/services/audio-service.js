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


// Retrieves a list of protected audio filenames for a given station ID
export async function getProtectedAudioByStationId(stationId) {
    const sql = `
        SELECT file_name
        FROM audio
        JOIN detection ON audio.audio_id = detection.audio_id
        JOIN station ON detection.station_id = station.station_id
        WHERE station.station_id = $1 AND audio.protected = true
    `;

    const result = await db.query(sql, [stationId]);
    return result.rows || [];
}

// Sends request to fetch audio from a station
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

// Sets the protection status for a given audio ID
export async function protectAudioById(audioId, protectAudio) {
    const sql = `
        UPDATE audio
        SET protected = $1
        WHERE audio_id = $2
    `;

    const result = await db.query(sql, [protectAudio, audioId]);
    return result;
}