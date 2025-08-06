import { useState, useEffect } from 'react';
import axios from 'axios';

/*
Hook to fetch species summary for a given station.
Returns an array of summary stats objects (key and value).
Re-fetches when the stationId changes or new filters are received.
*/
export default function useSpeciesSummary(stationId, { filters }) {
    const [speciesSummary, setSpeciesSummary] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!stationId) {
            setSpeciesSummary([]);
            return;
        }

        const fetchSpeciesSummary = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/species-summary/${stationId}`, {
                    params: filters,
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                const statsArray = Object.entries(response.data.result || {}).map(([key, value]) => ({
                    key: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                    value
                }));
                setSpeciesSummary(statsArray || []);
            } catch (error) {
                setError(error);
                setSpeciesSummary([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSpeciesSummary();
    }, [stationId, filters]);

    return { speciesSummary, loading, error };
}