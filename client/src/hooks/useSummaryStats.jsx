import { useState, useEffect, useContext } from 'react';
import SocketContext from '../contexts/SocketContext';
import axios from 'axios';

/*
Hook to fetch summary statistics for a given station.
Returns an array of summary stats objects with label and value.
Re-fetches when a new detection is received on the room socket or when the stationId changes.
*/
export default function useSummaryStats(stationId) {
    const [summaryStats, setSummaryStats] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;

    useEffect(() => {
        if (!stationId) {
            setSummaryStats([]);
            return;
        }

        const fetchSummaryStats = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/detection-summary/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });

                // format labels for readability
                const statsArray = Object.entries(response.data.result || {}).map(([key, value]) => ({
                    label: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
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

        const handleNewDetection = (detection) => {
            if (detection.station_id === stationId) {
                fetchSummaryStats();
            }
        };

        // Initial fetch 
        fetchSummaryStats();

        // Listener for new detections on the station's room
        if (!socket || !isConnected) return;
        socket.on("newDetection", handleNewDetection);
        return () => socket.off("newDetection", handleNewDetection);

    }, [stationId, socket, isConnected]);

    return { summaryStats, loading, error };
}