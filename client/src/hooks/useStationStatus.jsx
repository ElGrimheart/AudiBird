import { useState, useEffect, useContext } from 'react';
import SocketContext from '../contexts/SocketContext';
import axios from 'axios';

/*
Hook to fetch latest station status for a given station.
Returns an array of status objects.
Re-fetches when a new status is received via room socket or when the stationId changes.
*/
export default function useStationStatus(stationId) {
    const [stationStatus, setStationStatus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;

    useEffect(() => {
        if (!stationId) {
            setStationStatus([]);
            return;
        }

        const fetchStationStatus = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_STATIONS_URL}/status/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setStationStatus(response.data.result || []);
            } catch (error) {
                setError(error);
                setStationStatus([]);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchStationStatus();

        // Re-fetch on status update
        const handleStatusUpdate = (status) => {
            if (status.station_id === stationId) {
                fetchStationStatus();
            }
        };

        // Listener for new detections on the station's room
        if (!socket || !isConnected) return;
        socket.on("statusUpdate", handleStatusUpdate);
        return () => socket.off("statusUpdate", handleStatusUpdate);

    }, [stationId, socket, isConnected]);

    return { stationStatus, loading, error };
}