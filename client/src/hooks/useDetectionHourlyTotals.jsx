import { useState, useEffect } from 'react';
import axios from 'axios';

/* Hook to fetch species trends for a given station. Returns an array of trend objects. */
export default function useDetectionHourlyTotals(stationId, { filters} ) {
    const [detectionHourlyTotals, setDetectionHourlyTotals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setDetectionHourlyTotals([]);
            return;
        }

        async function fetchDetectionHourlyTotals() {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/hourly-detection-totals/${stationId}`, {
                    params: {
                        singleDate: filters.singleDate,
                        speciesName: filters.species,
                        minConfidence: filters.minConfidence
                    },
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('jwt')}`
                    },
                });
                setDetectionHourlyTotals(response.data.result || []);
            } catch (error) {
                setError(error);
                setDetectionHourlyTotals([]);
            } finally {
                setLoading(false);
            }
        }

        fetchDetectionHourlyTotals();
    }, [stationId, filters]);

    return { detectionHourlyTotals, loading, error };
}