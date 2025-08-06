import React, { useEffect, useState, useContext } from 'react';
import StationMetadataContext from '../contexts/StationMetadataContext';
import SelectedStationContext from '../contexts/SelectedStationContext';
import axios from 'axios';

// StationMetadataProvider component to manage metadata for the selected station
export default function StationMetadataProvider({ children }) {
    const { selectedStation } = useContext(SelectedStationContext);

    const [stationConfig, setStationConfig] = useState(null);
    const [stationDateRange, setStationDateRange] = useState({ startDate: null, endDate: null });
    const [stationSpeciesList, setStationSpeciesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!selectedStation) {
            return;
        }

        const fetchStationMetadata = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_STATION_URL}/metadata/${selectedStation}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                });
                setStationConfig(response.data.result.user_config || null);
                setStationDateRange({
                    startDate: response.data.result.first_detection || null,
                    endDate: response.data.result.last_detection || null
                });
                setStationSpeciesList(response.data.result.species_list || []);
            } catch (error) {
                setError(error.message || "Error fetching station metadata");
            } finally {
                setLoading(false);
            }
        };

        fetchStationMetadata();
    }, [selectedStation]);

    return (
        <StationMetadataContext.Provider value={{ stationConfig, stationDateRange,stationSpeciesList, loading, error }}>
            {children}
        </StationMetadataContext.Provider>
    );
}