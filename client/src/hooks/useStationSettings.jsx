import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/* 
Hook for fetching and updating a stations settings
*/
export default function useStationSettings(stationId) {
    const [stationSettings, setStationSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!stationId) {
            setStationSettings(null);
            return;
        }
        
        const fetchStationSettings = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_STATIONS_URL}/config/${stationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setStationSettings(response.data? response.data.result.station_config : null);
            } catch (error) {
                console.error("Error fetching station config:", error);
                setError('Failed to load station configuration.');
                setStationSettings(null);
            } finally {
                setLoading(false);
            }
        };
        fetchStationSettings();
    }, [stationId]);


    // Sends request back to API with updated station setting. Updates local state on success
    const updateStationSettings = useCallback(async (values) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_STATIONS_URL}/config/${stationId}`,
                values,
                { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
            );
            if (response.status === 200) {
                setStationSettings(response.data.result || values); // pass back updated values to state
            }
            return response
        } catch (error) {
            setError('Failed to save configuration.');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [stationId]);

    return { stationSettings, loading, error, updateStationSettings };
}