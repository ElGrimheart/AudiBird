import { useState } from 'react';
import axios from 'axios';

/*
Hook to handle starting and stopping a station recording.
Submits a request to the API to start or stop recording for a specific station.
Returns a function to start or stop the recording
*/
export default function useStartStopStation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startStopRecording = async (stationId, isRecording) => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = isRecording ? `${import.meta.env.VITE_API_STATIONS_URL}/stop/${stationId}` : `${import.meta.env.VITE_API_STATIONS_URL}/start/${stationId}`;

            const response = await axios.post(endpoint, {},{
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
            });

            return response.data;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { startStopRecording, loading, error };
}