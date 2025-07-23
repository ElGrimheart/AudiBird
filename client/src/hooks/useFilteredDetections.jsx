import { useState, useCallback } from 'react';
import axios from 'axios';

export default function useDetections(stationId) {
    const [detections, setDetections] = useState([]);
    const [error, setError] = useState(null)
    const [fieldErrors, setFieldErrors] = useState({});

    const fetchDetections = useCallback(async (filters = {}) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_DETECTION_URL}/filtered/${stationId}`, { params: filters });
        setDetections(response.data.result || []);
        setError(null);
        setFieldErrors({});
    } catch (error) {
        console.error('Failed to fetch detections:', error);

        // API error response handling
        const generalError = error.response?.data?.errors?.map(err => err.msg).join(', ') || 'An error occurred';
        setError(generalError); 
        setFieldErrors(
            error.response?.data?.errors?.reduce((acc, curr) => {
                acc[curr.path] = curr.msg;
                return acc;
            }, {}) || {}
        );
        setDetections([]);
    }
}, [stationId]);

    return [detections, fetchDetections, error, fieldErrors];
}