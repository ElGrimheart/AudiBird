import React, { useContext } from "react";
import { Bar } from "react-chartjs-2";
import ChartFilterBar from "./ChartFilterBar";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import useDetectionDailyTotals from "../../hooks/useDetectionDailyTotals.jsx";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";

/*
CompositionChart component to display daily species composition in chart form
Uses a bar chart to visualize the percentage of each species detected per day
Filters can be applied to adjust the date range and species selection
*/
export default function CompositionChart({filters, setFilters}) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { detectionDailyTotals, loading, error } = useDetectionDailyTotals(selectedStation, { filters });

    // Unique dates for x-axis labels
    const dates = [...new Set(detectionDailyTotals.map(row => row.date))];
    const speciesData = {};

    // Calculating daily composition percentages
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


    // Assemble chart data and display options
    const chartData = {
        labels: dates.map(date => new Date(date).toLocaleDateString()),
        datasets: Object.entries(speciesData).map(([speciesName, data], i) => ({
            label: speciesName,
            data,
            backgroundColor: `hsl(${i * 40}, 70%, 50%)`,
            borderColor: `hsl(${i * 40}, 70%, 30%)`,
            borderWidth: 1,
            fill: true
        }))
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' },
            datalabels: { display: false }
        },
        scales: {
            x: { title: { display: true, text: 'Date', font: { size: 18 } } },
            y: { title: { display: true, text: '% of Detections', font: { size: 18 } }, beginAtZero: true }
        }
    };

    return (
        <ComponentCard title="Daily Species Composition">
            {/* Filter bar */}
            <ChartFilterBar
                filters={filters}
                setFilters={setFilters}
                showDateRange={true}
                showMinConfidence={true}
            />

            {/* Error handling  and loading state */}
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <SkeletonComponent height={450}/> : (
               
               /* Bar chart */
               <div className="analytics-chart">
                   <Bar
                       key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                       data={chartData}
                       options={chartOptions}
                   />
               </div>
            )}
        </ComponentCard>
    );
}