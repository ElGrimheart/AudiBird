import React, { useEffect, useState, useContext } from "react";
import { Button } from "react-bootstrap";
import SelectedStationContext from "../../contexts/SelectedStationContext";
import StationMetadataContext from "../../contexts/StationMetadataContext";
import SpeciesStats from "./SpeciesStats.jsx";

/*
Component to display species statistics for the selected station.
Multiple summaries with independent filters can be created.
*/
export default function SpeciesCard() {
    const { selectedStation } = useContext(SelectedStationContext);
    const { stationSpeciesList } = useContext(StationMetadataContext);

    // Generate default filters based on the selected station and its date range
    const generateDefaultFilters = () => ({
        stationId: selectedStation,
        speciesName: stationSpeciesList[0] || "All Species"
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
                    {/* Render remove chart button if there are multiple charts */}
                    {statConfigs.length > 1 && (
                        <div className="text-end mb-1">
                            <Button variant="danger" onClick={() => removeStats(stat.id)}>
                                <i className="bi bi-x-lg"></i> Remove Chart
                            </Button>
                        </div>
                    )}

                    {/* SpeciesStats component with selected filters */}
                    <SpeciesStats
                        filters={stat.filters}
                        setFilters={(newFilters) => updateFilters(stat.id, newFilters)}
                    />
                </div>
            ))}

            {/* Button to add another species stats card */}
            <div className="text-center mt-4">
                <Button variant="success" onClick={addStats}>
                    <i className="bi bi-plus-lg"></i> Add Another Chart
                </Button>
            </div>
        </div>
    );
}