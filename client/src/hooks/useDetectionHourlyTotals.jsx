import { useState, useEffect } from 'react';
import axios from 'axios';

/* 
Hook to fetch hourly detection totals for a given station.
Returns an array of hourly detection total objects with hour and count.
Filterable by date, species, and minimum confidence.
Re-fetches when the stationId changes or new filters are received.
 */
export default function useDetectionHourlyTotals(stationId, { filters} ) {
    const [detectionHourlyTotals, setDetectionHourlyTotals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setDetectionHourlyTotals([]);
            return;
        }

        const fetchDetectionHourlyTotals = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/hourly-detection-totals/${stationId}`, {
                    params: filters,
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setDetectionHourlyTotals(response.data.result || []);
            } catch (error) {
                setError(error);
                setDetectionHourlyTotals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDetectionHourlyTotals();
    }, [stationId, filters]);

    return { detectionHourlyTotals, loading, error };
}