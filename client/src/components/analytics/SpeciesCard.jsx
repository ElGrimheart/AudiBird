import React, { useEffect, useState, useContext } from "react";
import { Button } from "react-bootstrap";
import SelectedStationContext from "../../contexts/SelectedStationContext";
import StationMetadataContext from "../../contexts/StationMetadataContext";
import SpeciesStats from "./SpeciesStats.jsx";

// Component to display species trends charts for the selected station. 
// Allows adding multiple charts with independent filters.
export default function SpeciesCard() {
    const { selectedStation } = useContext(SelectedStationContext);
    const { stationSpeciesList } = useContext(StationMetadataContext);

    // Generate default filters based on the selected station and its date range
    const generateDefaultFilters = () => ({
        stationId: selectedStation,
        species: stationSpeciesList[0] || ""
    });


    // State and hooks to manage multiple stat card configurations
    const [statConfigs, setStatConfigs] = useState([]);

    useEffect(() => {
        setStatConfigs([
            { id: Date.now(), filters: generateDefaultFilters() }
        ]);
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStation, stationSpeciesList]);

    const addStats = () => {
        setStatConfigs(prev => [
            ...prev,
            { id: Date.now(), filters: generateDefaultFilters() }
        ]);
    };

    const updateFilters = (id, newFilters) => {
        setStatConfigs(prev =>
            prev.map(stat => stat.id === id ? { ...stat, filters: newFilters } : stat)
        );
    };

    const removeStats = (id) => {
        setStatConfigs(prev => prev.filter(stat => stat.id !== id));
    };

    return (
        <div>
            {statConfigs.map((stat) => (
                <div key={stat.id} className="mb-4">
                    {statConfigs.length > 1 && (
                        <div className="text-end mb-3">
                            <Button variant="outline-danger" onClick={() => removeStats(stat.id)}>
                                Remove Summary
                            </Button>
                        </div>
                    )}
                    <SpeciesStats 
                        filters={stat.filters}
                        setFilters={(newFilters) => updateFilters(stat.id, newFilters)}
                    />
                </div>
            ))}
            <div className="text-center mt-4">
                <Button variant="success" onClick={addStats}>
                    ➕ Add Another Summary
                </Button>
            </div>
        </div>
    );
}