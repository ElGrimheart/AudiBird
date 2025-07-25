import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useCommonSpecies(stationId, socket) {
    const [commonSpecies, setCommonSpecies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
                setCommonSpecies([]);
                return;
        
        }
        
        const fetchCommonSpecies = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_DETECTION_URL}/common/${stationId}`);
                setCommonSpecies(response.data.result || []);
            } catch (error) {
                setError(error);
                setCommonSpecies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCommonSpecies();

        if (!socket) return;

        socket.on("newDetection", fetchCommonSpecies);
        return () => socket.off("newDetection", fetchCommonSpecies);

    }, [stationId, socket]);

    return { commonSpecies, loading, error };
}