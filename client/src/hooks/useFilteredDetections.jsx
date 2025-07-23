import { useState, useCallback } from 'react';
import axios from 'axios';

export default function useDetections(stationId) {
    const [detections, setDetections] = useState([]);
    const [error, setError] = useState(null)

    const fetchDetections = useCallback(async (filters = {}) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_DETECTION_URL}/filtered/${stationId}`, { params: filters });
        setDetections(response.data.result || []);
        setError(null);
    } catch (error) {
        console.error('Failed to fetch detections:', error);

        // API error response handling
        if (error.response && error.response.data.errors) {
            const errorMessages = error.response.data.errors.map(err => `${err.path}: ${err.msg}`).join(', ');
            setError({ general: `Request failed: ${errorMessages}` });
        } else {
            setError({ general: 'An unexpected error occurred' }); // Fallback error
        }
        setDetections([]);
    }
}, [stationId]);

    return [detections, fetchDetections, error];
}