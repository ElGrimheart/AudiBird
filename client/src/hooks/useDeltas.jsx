import { useState, useEffect } from 'react';
import axios from 'axios';

// Hook to fetch deltas for a given station. Returns an object with current and previous deltas.
export default function useDeltas(stationId, { startDate, endDate, speciesName, minConfidence }) {
    const [deltas, setDeltas] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setDeltas({});
            return;
        }

        const fetchDeltas = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/deltas/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                    params: { startDate, endDate, speciesName, minConfidence }
                });
                setDeltas(response.data.result || {});
            } catch (error) {
                setError(error);
                setDeltas({});
            } finally {
                setLoading(false);
            }
        };

        fetchDeltas();
    }, [stationId, startDate, endDate, speciesName, minConfidence]);

    return { deltas, loading, error };
}   