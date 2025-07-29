import { useState, useEffect } from 'react';
import axios from 'axios';

/* Hook to fetch average detections for a given station. Returns an array of average detections objects with hour and count.
updates when a new detection is received via room socket.*/
export default function useAverageDetections(stationId, { startDate, endDate }) {
    const [averageDetections, setAverageDetections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
            if (!stationId) {
                setAverageDetections([]);
                return;
            }

            const filters = { startDate: startDate || "", endDate: endDate || "" };

            const fetchAverageDetections = async () => {
                setLoading(true);
                setError(null);
    
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/average-detections/${stationId}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                        params: filters,
                    });
                    setAverageDetections(response.data.result || []);
                } catch (error) {
                    setError(error);
                    setAverageDetections([]);
                } finally {
                    setLoading(false);
                }
            }
    
            fetchAverageDetections();

        }, [stationId, startDate, endDate]);

        return { averageDetections, loading, error };
    }