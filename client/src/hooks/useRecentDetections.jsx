import { useState, useEffect } from 'react';
import axios from 'axios';

/* Hook to fetch recent detections for a given station. Returns an array of detection objects.
Updates when a new detection is received via socket. */
export default function useRecentDetections(stationId, socket) {
    const [recentDetections, setRecentDetections] = useState([]);

    useEffect(() => {
        const fetchRecentDetections = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/stations/${stationId}/detections/recent`);
                setRecentDetections(response.data.result || []);
            } catch (error) {
                console.error('Failed to fetch detections:', error);
                setRecentDetections([]);
            }
        };

        fetchRecentDetections();

        if (!socket) 
            return;
        
        socket.on("newDetection", fetchRecentDetections);
        return () => socket.off("newDetection", fetchRecentDetections);

    }, [stationId, socket]);

    return recentDetections;
}