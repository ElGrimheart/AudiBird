import { useState, useEffect, useContext } from 'react';
import SocketContext from '../contexts/SocketContext';
import axios from 'axios';

/* Hook to fetch common species for a given station. Returns an array of common species objects with common name and count.
updates when a new detection is received via room socket.*/
export default function useCommonSpecies(stationId) {
    const [commonSpecies, setCommonSpecies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;

    useEffect(() => {
        if (!stationId) {
            setCommonSpecies([]);
            return;
        }

        async function fetchCommonSpecies() {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_DETECTION_URL}/common/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setCommonSpecies(response.data.result || []);
            } catch (error) {
                setError(error);
                setCommonSpecies([]);
            } finally {
                setLoading(false);
            }
        }

        function handleNewDetection(detection) {
            if (detection.station_id === stationId) {
                fetchCommonSpecies();
            }
        }

        // Initial fetch of common species
        fetchCommonSpecies();

        // Socket listener for new detections
        if (!socket || !isConnected) return;
        socket.on("newDetection", handleNewDetection);
        return () => socket.off("newDetection", handleNewDetection);

    }, [stationId, socket, isConnected]);

    return { commonSpecies, loading, error };
}