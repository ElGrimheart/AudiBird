import { useState, useEffect } from 'react';
import axios from 'axios';

/* Hook to fetch recent detections for a given station. Returns an array of detection objects.
Updates when a new detection is received via socket. */
export default function useRecentDetections(stationId, socket) {
    const [recentDetections, setRecentDetections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setRecentDetections([]);
            return;
        }

        const fetchRecentDetections = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_DETECTION_URL}/recent/${stationId}`);
                setRecentDetections(response.data.result || []);
            } catch (error) {
                setError(error);
                setRecentDetections([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentDetections();

        if (!socket) 
            return;
        
        socket.on("newDetection", fetchRecentDetections);
        return () => socket.off("newDetection", fetchRecentDetections);

    }, [stationId, socket]);

    return { recentDetections, loading, error };
}