import { useState, useEffect } from 'react';
import axios from 'axios';

/* 
Hook to fetch daily detection totals for a given station.
Returns an array of daily detection total objects with date and count.
Filterable by date range, species, and minimum confidence.
Re-fetches when the stationId changes or new filters are received.
*/
export default function useDetectionDailyTotals(stationId, { filters} ) {
    const [detectionDailyTotals, setDetectionDailyTotals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setDetectionDailyTotals([]);
            return;
        }

        const fetchDetectionDailyTotals = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/daily-detection-totals/${stationId}`, {
                    params: filters,
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setDetectionDailyTotals(response.data.result || []);
            } catch (error) {
                setError(error);
                setDetectionDailyTotals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDetectionDailyTotals();
    }, [stationId, filters]);

    return { detectionDailyTotals, loading, error };
}