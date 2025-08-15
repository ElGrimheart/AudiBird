import React, { useEffect, useState, useContext } from 'react';
import StationMetadataContext from '../contexts/StationMetadataContext';
import SelectedStationContext from '../contexts/SelectedStationContext';
import axios from 'axios';

/*
StationMetadataProvider component to manage metadata state for the selected station
Fetches the station metadata which is used for populating various fields and determining filter options throughout the app
*/
export default function StationMetadataProvider({ children }) {
    const { selectedStation } = useContext(SelectedStationContext);
    
    const [stationDateRange, setStationDateRange] = useState({ startDate: null, endDate: null });
    const [stationSpeciesList, setStationSpeciesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStationMetadata = async () => {
        if (!selectedStation) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_STATIONS_URL}/metadata/${selectedStation}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
            });
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

    useEffect(() => {
        fetchStationMetadata();
    }, [selectedStation ]);

    return (
        <StationMetadataContext.Provider value={{ fetchStationMetadata, stationDateRange,stationSpeciesList, loading, error }}>
            {children}
        </StationMetadataContext.Provider>
    );
}