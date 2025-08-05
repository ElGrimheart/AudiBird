import { useState, useEffect, useContext } from 'react';
import SocketContext from '../contexts/SocketContext';
import axios from 'axios';

/* Hook to fetch recent detections for a given station. Returns an array of detection objects.
Updates when a new detection is received via room socket. */
export default function useRecentDetections(stationId) {
    const [recentDetections, setRecentDetections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;

    useEffect(() => {
        if (!stationId) {
            setRecentDetections([]);
            return;
        }

        async function fetchRecentDetections() {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_DETECTION_URL}/recent/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setRecentDetections(response.data.result || []);
            } catch (error) {
                setError(error);
                setRecentDetections([]);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch of recent detections
        fetchRecentDetections();

        // Socket listener for new detections
        function handleNewDetection(detection) {
            if (detection.station_id === stationId) {
                fetchRecentDetections();
            }
        };

        if (!socket || !isConnected) return;
        socket.on("newDetection", handleNewDetection);
        return () => socket.off("newDetection", handleNewDetection);

    }, [ stationId, socket, isConnected]);

    return { recentDetections, loading, error };
}