import React, { useEffect, useState, useContext } from "react";
import { Button } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import SelectedStationContext from "../../contexts/SelectedStationContext";
import StationMetadataContext from "../../contexts/StationMetadataContext";
import TrendsChart from "./TrendsChart";

/*
TrendsCard component to display trends in species detections over time
Allows adding multiple trend charts with independent filters.
*/
export default function TrendsCard() {
    const { selectedStation } = useContext(SelectedStationContext);
    const { stationDateRange, stationSpeciesList } = useContext(StationMetadataContext);

    // Generate default filters based on the selected station and its date range
    const generateDefaultFilters = () => ({
        stationId: selectedStation,
        startDate: stationDateRange?.startDate || "",
        endDate: stationDateRange?.endDate || ""
    });


    // State and hooks to manage multiple chart configurations
    const [chartConfigs, setChartConfigs] = useState([]);

    useEffect(() => {
        setChartConfigs([
            { id: Date.now(), filters: generateDefaultFilters() }
        ]);
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStation, stationDateRange, stationSpeciesList]);

    const addChart = () => {
        setChartConfigs(prev => [
            ...prev,
            { id: Date.now(), filters: generateDefaultFilters() }
        ]);
    };

    const updateFilters = (id, newFilters) => {
        setChartConfigs(prev =>
            prev.map(chart => chart.id === id ? { ...chart, filters: newFilters } : chart)
        );
    };

    const removeChart = (id) => {
        setChartConfigs(prev => prev.filter(chart => chart.id !== id));
    };

    return (
        <div>
            {chartConfigs.map((chart) => (
                <div key={chart.id} className="mb-4">

                    {/* Render remove chart button if there are multiple charts */}
                    {chartConfigs.length > 1 && (
                        <div className="text-end mb-1">
                            <Button variant="danger" onClick={() => removeChart(chart.id)}>
                                <i className="bi bi-x-lg"></i> Remove Chart
                            </Button>
                        </div>
                    )}

                    {/* TrendsChart component with selected filters */}
                    <TrendsChart
                        filters={chart.filters}
                        setFilters={(newFilters) => updateFilters(chart.id, newFilters)}
                    />
                </div>
            ))}

            {/* Button to add another chart */}
            <div className="text-center mt-4">
                <Button variant="success" onClick={addChart}>
                    <i className="bi bi-plus-lg"></i> Add Another Chart
                </Button>
            </div>
        </div>
    );
}