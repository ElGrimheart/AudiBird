import React, { useEffect, useState } from 'react';
import UserStationsContext from '../contexts/UserStationsContext';
import axios from 'axios';

// UserStationsProvider component to manage which stations the user has access to
export default function UserStationsProvider({ children }) {
    const [stations, setStations] = useState(() => {
        return JSON.parse(localStorage.getItem("userStations")) || [];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem("userStations", JSON.stringify(stations));
    }, [stations]);

    const fetchUserStations = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`${import.meta.env.VITE_API_USERS_URL}/stations`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
          });
          setStations(response.data.result || []);
        } catch (error) {
          setError(error.message || "Error fetching stations");
        } finally {
          setLoading(false);
        }
    };

    return (
        <UserStationsContext.Provider value={{ stations, loading, error, fetchUserStations }}>
          {children}
        </UserStationsContext.Provider>
    );
}