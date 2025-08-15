import React, { useEffect, useState, useCallback, useContext } from 'react';
import UserPreferencesContext from '../contexts/UserPreferencesContext';
import SelectedStationContext from '../contexts/SelectedStationContext';
import axios from 'axios';

export default function UserPreferencesProvider({ children }) {
    const { selectedStation } = useContext(SelectedStationContext);

    const [userPreferences, setUserPreferences] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserPreferences = useCallback(async () => {
        if (!selectedStation) {
            setUserPreferences(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_USERS_URL}/preferences/${selectedStation}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
            });
            setUserPreferences(response.data?.result || null);
        } catch (error) {
            console.log("Error fetching user preferences:", error);
            setError('Failed to load notification settings.');
            setUserPreferences(null);
        } finally {
            setLoading(false);
        }
    }, [selectedStation]);

    useEffect(() => {
        fetchUserPreferences();
    }, [selectedStation]);

    const updateUserPreferences = useCallback(async (values) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_USERS_URL}/preferences/${selectedStation}`,
                values,
                { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
            );
            if (response.status === 200) {
                // Optionally re-fetch to ensure latest data from server
                setUserPreferences(response.data?.result || null);
            }
            return response;
        } catch (error) {
            setError('Failed to save notification settings.');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [selectedStation]);

    return (
        <UserPreferencesContext.Provider value={{ userPreferences, loading, error, fetchUserPreferences, updateUserPreferences }}>
            {children}
        </UserPreferencesContext.Provider>
    );
}