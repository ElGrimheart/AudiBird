import { useState, useEffect } from 'react';
import axios from 'axios';

/* Hook to fetch species trends for a given station. Returns an array of trend objects. */
export default function useSpeciesTrends(stationId) {
    const [speciesTrends, setSpeciesTrends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setSpeciesTrends([]);
            return;
        }

        const fetchSpeciesTrends = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/species-trends/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setSpeciesTrends(response.data.result || []);
            } catch (error) {
                setError(error);
                setSpeciesTrends([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSpeciesTrends();
        console.log("Fetched species trends for station:", stationId);
    }, [stationId]);

    return { speciesTrends, loading, error };
}