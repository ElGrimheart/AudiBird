import React, { useContext } from "react";
import { Line } from "react-chartjs-2";
import ChartFilterBar from "./ChartFilterBar";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import useDetectionDailyTotals from "../../hooks/useDetectionDailyTotals.jsx";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";

/*
DailyTotalsChart component to display daily species activity in chart form
Uses a line chart to visualize the number of detections per species per day
Filters can be applied to adjust the date range and species selection
*/
export default function DailyTotalsChart({ filters, setFilters }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { detectionDailyTotals, loading, error } = useDetectionDailyTotals(selectedStation, { filters });

    // Unique dates for x-axis labels
    const dates = Array.from(new Set(detectionDailyTotals.map(row => row.date))).sort();
    const speciesList = Array.from(new Set(detectionDailyTotals.map(row => row.common_name)));

    // Group counts by species
    const countMap = {};
    detectionDailyTotals.forEach(row => {
    countMap[`${row.date}|${row.common_name}`] = Number(row.count);
    });

    // Assemble chart data and display options
    const chartData = {
        labels: dates.map(date => new Date(date).toLocaleDateString()),
        datasets: speciesList.map((speciesName, i) => ({
            label: speciesName,
            data: dates.map(date => countMap[`${date}|${speciesName}`] || 0),
            borderColor: `hsl(${i * 40}, 70%, 50%)`,
            backgroundColor: `hsla(${i * 40}, 70%, 50%, 0.2)`,
            fill: false,
            tension: 0.3
        }))
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'right' },
            datalabels: { display: false }
        },
        scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Detections' }, beginAtZero: true }
        }
        };

    return (
        <ComponentCard title="Daily Species Activity">
            {/* Filter bar */}
            <ChartFilterBar 
                filters={filters}
                setFilters={setFilters}
                showDateRange={true}
                showSpeciesSelect={true}
                showMinConfidence={true}
            />

            {/* Error handling and loading state */}
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (

                /* Line chart */
                <Line 
                    key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                    data={chartData} 
                    options={chartOptions} 
                />
            )}
        </ComponentCard>
    );
}