import React, { useEffect, useState } from 'react';
import UserStationsContext from '../contexts/UserStationsContext';
import axios from 'axios';

/*
UserStationsProvider component - fetches list of users stations including station specific access permissions.
Controls which station data that a user can view, edit or delete
*/
export default function UserStationsProvider({ children }) {
    const [usersStations, setUsersStations] = useState(() => {
        return JSON.parse(localStorage.getItem("userStations")) || [];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem("userStations", JSON.stringify(usersStations));
    }, [usersStations]);

    const fetchUserStations = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`${import.meta.env.VITE_API_USERS_URL}/stations`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
          });
          setUsersStations(response.data.result || []);
        } catch (error) {
          setError(error.message || "Error fetching stations");
        } finally {
          setLoading(false);
        }
    };

    return (
        <UserStationsContext.Provider value={{ usersStations, loading, error, fetchUserStations }}>
          {children}
        </UserStationsContext.Provider>
    );
}