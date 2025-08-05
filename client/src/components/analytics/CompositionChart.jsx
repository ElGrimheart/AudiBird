import React, { useContext } from "react";
import ChartFilterBar from "./ChartFilterBar";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import useDetectionDailyTotals from "../../hooks/useDetectionDailyTotals.jsx";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);

export default function CompositionChart({filters, setFilters}) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { detectionDailyTotals, loading, error } = useDetectionDailyTotals(selectedStation, { filters });

    // Get unique dates for x-axis labels
    const dates = [...new Set(detectionDailyTotals.map(row => row.date))];
    const speciesData = {};

    // Calculate daily composition percentages
    dates.forEach(date => {
        const dailyData = detectionDailyTotals.filter(row => row.date === date);
        const total = dailyData.reduce((sum, row) => sum + parseInt(row.count, 0), 0);
        dailyData.forEach(row => {
            if (!speciesData[row.common_name]) {
                speciesData[row.common_name] = Array(dates.length).fill(0);
            }
            const dateIndex = dates.indexOf(date);
            speciesData[row.common_name][dateIndex] += parseInt(row.count, 0)*100 / total;
        });
    });

    // Build chart data
    const chartData = {
        labels: dates.map(date => new Date(date).toLocaleDateString()),
        datasets: Object.entries(speciesData).map(([species, data], i) => ({
            label: species,
            data,
            backgroundColor: `hsl(${i * 40}, 70%, 50%)`,
            borderColor: `hsl(${i * 40}, 70%, 30%)`,
            borderWidth: 1,
            fill: true
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
            y: { title: { display: true, text: '% of Detections' }, beginAtZero: true }
        }
    };

    return (
        <ComponentCard title="Daily Species Composition">
            <ChartFilterBar
                filters={filters}
                setFilters={setFilters}
                showDateRange={true}
                showMinConfidence={true}
            />
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <SkeletonComponent height={200}/> : (
                <Bar
                    key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                    data={chartData}
                    options={chartOptions}
                />
            )}
        </ComponentCard>
    );
}