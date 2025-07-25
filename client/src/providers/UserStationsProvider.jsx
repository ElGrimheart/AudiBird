import React, { useState } from 'react';
import UserStationsContext from '../contexts/UserStationsContext';
import axios from 'axios';


export const UserStationsProvider = ({ children }) => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUserStations = async (token) => {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/stations`, {
            headers: { Authorization: `Bearer ${token}` },
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
};

export default UserStationsProvider;