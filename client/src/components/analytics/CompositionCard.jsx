import React, { useEffect, useState, useContext } from "react";
import { Button } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import SelectedStationContext from "../../contexts/SelectedStationContext";
import StationMetadataContext from "../../contexts/StationMetadataContext";
import CompositionChart from "./CompositionChart";

/* 
Component to display composition trends charts for the selected station.
Allows adding multiple charts with independent filters. 
*/
export default function CompositionCard() {
    const { selectedStation } = useContext(SelectedStationContext);
    const { stationDateRange, stationSpeciesList } = useContext(StationMetadataContext);

    // Generate default filters based on the selected station and its date range
    const generateDefaultFilters = () => ({
        stationId: selectedStation,
        startDate: stationDateRange?.startDate || "",
        endDate: stationDateRange?.endDate || ""
    });


    // State and hook to manage multiple chart configurations and their filters
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

                    {/* Remove button if there are multiple charts */}
                    {chartConfigs.length > 1 && (
                        <div className="text-end mb-1">
                            <Button variant="danger" onClick={() => removeChart(chart.id)}>
                                <i className="bi bi-x-lg"></i> Delete Chart
                            </Button>
                        </div>
                    )}

                    {/* Render the CompositionChart with selected filters */}
                    <CompositionChart
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