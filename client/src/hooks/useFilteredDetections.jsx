import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function useDetections(stationId) {
    const [detections, setDetections] = useState([]);

    const fetchDetections = useCallback(async (filters = {}) => {
        try {
            const params = {
                from: filters.from || undefined,
                to: filters.to || undefined,
                species: filters.species || undefined,
                sort_by: filters.sort_by,
                sort: filters.sort
            };

            if (
                filters.min_confidence !== '' &&
                !isNaN(Number(filters.min_confidence)) 
                ) { params.min_confidence = Number(filters.min_confidence); }

            if (filters.max_confidence !== '' &&
                !isNaN(Number(filters.max_confidence))
                ) { params.max_confidence = Number(filters.max_confidence); }

            const response = await axios.get(`${API_URL}/stations/${stationId}/detections/`, { params });
            setDetections(response.data.result || []);
        } catch (error) {
            console.error('Failed to fetch detections:', error);
            setDetections([]);
        }
    }, [stationId]);

    return [detections, fetchDetections];
}