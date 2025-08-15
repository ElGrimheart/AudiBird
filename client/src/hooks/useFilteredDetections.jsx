import { useState, useCallback } from 'react';
import axios from 'axios';

/*
Hook to fetch filtered detections for a given station. 
Returns an array of detection objects.
Filterable by date range, species, minimum and maximum confidence.
Re-fetches when the stationId changes or new filters are applied.
*/
export default function useDetections(stationId) {
    const [detections, setDetections] = useState([]);
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false);

    const fetchDetections = useCallback(async (filters = {}) => {
        if (!stationId) {
            setDetections([]);
            return;
        }
    
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_DETECTIONS_URL}/filtered/${stationId}`, { 
                params: filters, 
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } });
            setDetections(response.data.result || []);
            setError(null);
        } catch (error) {

            if (error.response && error.response.status === 404) {
                setDetections([]);
            }

            // Handle API validation errors
            if (error.response && error.response.data.errors) {
                const errorMessages = error.response.data.errors.map(err => `${err.path}: ${err.msg}`).join(', ');
                setError({ general: `Request failed: ${errorMessages}` });
            } 
            setDetections([]);
        } finally {
            setLoading(false);
        }
}, [stationId]);

    return [detections, fetchDetections, error, loading];
}