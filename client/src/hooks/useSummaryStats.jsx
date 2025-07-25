import { useState, useEffect } from 'react';
import axios from 'axios';

/*Hook to fetch summary statistics for a given station. Returns an array of summary stats objects (label and value).
Updates when a new detection is received via socket.*/
export default function useSummaryStats(stationId, socket) {
    const [summaryStats, setSummaryStats] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!stationId) {
            setSummaryStats([]);
            return;
        }

        const fetchSummaryStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_DETECTION_URL}/summary/${stationId}`);
                const statsArray = Object.entries(response.data.result || {}).map(([key, value]) => ({
                    label: key.replace(/\b\w/g, label => label.toUpperCase()),
                    value
                }));
                setSummaryStats(statsArray || []);
            } catch (error) {
                setError(error);
                setSummaryStats([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryStats();

        if (!socket) return;

        socket.on("newDetection", fetchSummaryStats);
        return () => socket.off("newDetection", fetchSummaryStats);

    }, [stationId, socket]);

    return { summaryStats, loading, error }
}