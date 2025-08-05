import React, { useEffect, useState, useContext } from "react";
import { Button } from "react-bootstrap";
import SelectedStationContext from "../../contexts/SelectedStationContext";
import StationMetadataContext from "../../contexts/StationMetadataContext";
import HourlyTotalsChart from "./HourlyTotalsChart";
import { formatDateToString } from "../../utils/dateFormatter";

// Component to display hourly totals charts for the selected station. 
// Allows adding multiple charts with independent filters.
export default function HourlyTotalsCard() {
    const { selectedStation } = useContext(SelectedStationContext);
    const { stationDateRange, stationSpeciesList } = useContext(StationMetadataContext);

    // Generate default filters based on the selected station and its date range
    const generateDefaultFilters = () => ({
        stationId: selectedStation,
        singleDate: formatDateToString(new Date()) || ""
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
                    <HourlyTotalsChart
                        filters={chart.filters}
                        setFilters={(newFilters) => updateFilters(chart.id, newFilters)}
                    />
                    {chartConfigs.length > 1 && (
                        <div className="text-end mb-3">
                            <Button variant="outline-danger" onClick={() => removeChart(chart.id)}>
                                Remove Chart
                            </Button>
                        </div>
                    )}
                </div>
            ))}
            <div className="text-center mt-4">
                <Button variant="success" onClick={addChart}>
                    ➕ Add Another Chart
                </Button>
            </div>
        </div>
    );
}