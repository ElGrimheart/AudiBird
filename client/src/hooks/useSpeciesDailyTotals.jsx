import { useState, useEffect } from 'react';
import axios from 'axios';

/* Hook to fetch species trends for a given station. Returns an array of trend objects. */
export default function useSpeciesDailyTotals(stationId) {
    const [speciesDailyTotals, setSpeciesDailyTotals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setSpeciesDailyTotals([]);
            return;
        }

        const fetchSpeciesDailyTotals = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/species-daily-totals/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setSpeciesDailyTotals(response.data.result || []);
            } catch (error) {
                setError(error);
                setSpeciesDailyTotals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSpeciesDailyTotals();
    }, [stationId]);

    return { speciesDailyTotals, loading, error };
}