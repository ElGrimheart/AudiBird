import { useState, useEffect } from 'react';
import axios from 'axios';

// Hook to fetch common species for a given station. Returns an array of species objects (common_name and count).
// Updates when a new detection is received via socket.
export default function useCommonSpecies(stationId, socket) {
    const [commonSpecies, setCommonSpecies] = useState([]);

    useEffect(() => {
        const fetchCommonSpecies = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/stations/${stationId}/detections/common`);
                setCommonSpecies(response.data.result || []);
            } catch (error) {
                console.error('Failed to fetch common species:', error);
                setCommonSpecies([]);
            }
        };

        fetchCommonSpecies();

        if (!socket) return;

        socket.on("newDetection", fetchCommonSpecies);
        return () => socket.off("newDetection", fetchCommonSpecies);

    }, [stationId, socket]);

    return commonSpecies;
}