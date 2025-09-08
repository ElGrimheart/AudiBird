import { useState, useEffect, useContext, useCallback } from 'react';
import SocketContext from '../contexts/SocketContext';
import axios from 'axios';

/* 
Hook to fetch common species for a given station. 
Returns an array of common species objects with common name and count.
Re-fetches when a new detection is received on the room socket or stationId changes.
*/
export default function useCommonSpecies(stationId, limit) {
    const [commonSpecies, setCommonSpecies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;
    
    const fetchCommonSpecies = useCallback(async () => {
        if (!stationId) {
            setCommonSpecies([]);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/common-species/${stationId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                params: { limit }
            });
            setCommonSpecies(response.data.result || []);
        } catch (error) {
            setError(error);
            setCommonSpecies([]);
        } finally {
            setLoading(false);
        }
    }, [stationId, limit]);

    useEffect(() => {
        fetchCommonSpecies();

        // Re-fetch on new detection
        const handleNewDetection = (detection) => {
            if (detection.station_id === stationId) {
                fetchCommonSpecies();
            }
        };

        if (!socket || !isConnected) return;
        socket.on("newDetection", handleNewDetection);
        return () => socket.off("newDetection", handleNewDetection);

    }, [stationId, limit, socket, isConnected, fetchCommonSpecies]);

    return { commonSpecies, loading, error, refetch: fetchCommonSpecies };
}