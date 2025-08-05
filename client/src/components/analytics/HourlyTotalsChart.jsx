import React, { useContext } from "react";
import { Line } from "react-chartjs-2";
import ChartFilterBar from "./ChartFilterBar";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import useDetectionHourlyTotals from "../../hooks/useDetectionHourlyTotals.jsx";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";

export default function HourlyTotalsChart({ filters, setFilters }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { detectionHourlyTotals, loading, error } = useDetectionHourlyTotals(selectedStation, { filters });

    // Get hours for x-axis labels
    const hours = Array.from(new Set(detectionHourlyTotals.map(row => Number(row.hour)))).sort((a, b) => a - b);
    const speciesList = Array.from(new Set(detectionHourlyTotals.map(row => row.common_name)));

    // Group counts by species
    const countMap = {};
    detectionHourlyTotals.forEach(row => {
        countMap[`${row.hour}|${row.common_name}`] = Number(row.count);
    });

    // Build datasets for Chart.js
    const chartData = {
        labels: hours.map(hour => hour.toString().padStart(2, "0") + ":00"),
        datasets: speciesList.map((species, i) => ({
            label: species,
            data: hours.map(hour => countMap[`${hour}|${species}`] || 0),
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
            x: { title: { display: true, text: 'Hour' } },
            y: { title: { display: true, text: 'Detections' }, beginAtZero: true }
        }
    };

    return (
        <ComponentCard title="Hourly Species Activity">
            <ChartFilterBar 
                filters={filters}
                setFilters={setFilters}
                showSingleDate={true}
                showSpeciesSelect={true}
                showMinConfidence={true}
            />
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (

                <Line 
                    key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                    data={chartData} 
                    options={chartOptions} 
                />
            )}
        </ComponentCard>
    );
}