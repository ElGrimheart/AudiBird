import { useState, useEffect } from 'react';
import axios from 'axios';

/* Hook to fetch species trends for a given station. Returns an array of trend objects. */
export default function useDetectionDailyTotals(stationId, { filters} ) {
    const [detectionDailyTotals, setDetectionDailyTotals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setDetectionDailyTotals([]);
            return;
        }

        async function fetchDetectionDailyTotals() {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/daily-detection-totals/${stationId}`, {
                    params: {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        speciesName: filters.species,
                        minConfidence: filters.minConfidence
                    },
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('jwt')}`
                    },
                });
                setDetectionDailyTotals(response.data.result || []);
            } catch (error) {
                setError(error);
                setDetectionDailyTotals([]);
            } finally {
                setLoading(false);
            }
        }

        fetchDetectionDailyTotals();
    }, [stationId, filters]);

    return { detectionDailyTotals, loading, error };
}