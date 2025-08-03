import { useState, useEffect } from 'react';
import axios from 'axios';

// Hook to fetch top confidence species data
export default function useTopConfidenceSpecies(stationId, { startDate, endDate, limit }) {
    const [topConfidenceSpecies, setTopConfidenceSpecies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setTopConfidenceSpecies([]);
            return;
        }

        const fetchTopConfidenceSpecies = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/top-confidence/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setTopConfidenceSpecies(response.data.result || []);
            } catch (err) {
                setError(err);
                setTopConfidenceSpecies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopConfidenceSpecies();
    }, [stationId, startDate, endDate, limit]);

    return { topConfidenceSpecies, loading, error };
}