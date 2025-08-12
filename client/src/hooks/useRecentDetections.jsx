import { useState, useEffect, useContext } from 'react';
import SocketContext from '../contexts/SocketContext';
import axios from 'axios';

/* 
Hook to fetch recent detections for a given station. 
Returns an array of detection objects.
Ref-fetches when a new detection is received via room socket or when the stationId changes.
*/
export default function useRecentDetections(stationId, limit) {
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

        const fetchRecentDetections = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_DETECTIONS_URL}/recent/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                    params: { limit }
                });
                setRecentDetections(response.data.result || []);
            } catch (error) {
                setError(error);
                setRecentDetections([]);
            } finally {
                setLoading(false);
            }
        };

        const handleNewDetection = (detection) => {
            if (detection.station_id === stationId) {
                fetchRecentDetections();
            }
        };

        // Initial fetch
        fetchRecentDetections();

        // Listener for new detections on the station's room
        if (!socket || !isConnected) return;
        socket.on("newDetection", handleNewDetection);
        return () => socket.off("newDetection", handleNewDetection);

    }, [stationId, limit, socket, isConnected]);

    return { recentDetections, loading, error };
}