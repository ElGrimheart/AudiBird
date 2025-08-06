import { useState, useEffect } from 'react';
import axios from 'axios';

/*
Hook to fetch hourly trends for a given station. 
Returns an array of hourly trend objects with hour and average count.
Filterable by date range, species, and minimum confidence.
Re-fetches when the stationId changes or new filters are received.
*/
export default function useHourlyTrends(stationId, { filters }) {
    const [hourlyTrends, setHourlyTrends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setHourlyTrends([]);
            return;
        }

        const fetchHourlyTrends = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/average-hourly-trends/${stationId}`, {
                    params: filters,
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setHourlyTrends(response.data.result || []);
            } catch (error) {
                setError(error);
                setHourlyTrends([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHourlyTrends();
    }, [stationId, filters]);

    return { hourlyTrends, loading, error };
}