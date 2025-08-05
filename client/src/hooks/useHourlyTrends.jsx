import { useState, useEffect } from 'react';
import axios from 'axios';

/* Hook to fetch species trends for a given station. Returns an array of trend objects. */
export default function useHourlyTrends(stationId, { filters }) {
    const [hourlyTrends, setHourlyTrends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setHourlyTrends([]);
            return;
        }

        async function fetchHourlyTrends() {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/average-hourly-trends/${stationId}`, {
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
                setHourlyTrends(response.data.result || []);
            } catch (error) {
                setError(error);
                setHourlyTrends([]);
            } finally {
                setLoading(false);
            }
        }

        fetchHourlyTrends();
    }, [stationId, filters]);

    return { hourlyTrends, loading, error };
}