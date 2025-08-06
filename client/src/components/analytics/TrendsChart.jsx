import React, { useContext } from "react";
import { Line } from "react-chartjs-2";
import ChartFilterBar from "./ChartFilterBar.jsx";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import useHourlyTrends from "../../hooks/useHourlyTrends.jsx";
import SkeletonComponent from "../common/SkeletonPlaceholder.jsx";
import ComponentCard from "../common/ComponentCard.jsx";

/*
TrendsChart component to display hourly trends in species detections
Uses a line chart to visualize average detections per hour
Filters can be applied to adjust the date range and species selection
*/
export default function TrendsChart({ filters, setFilters }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { hourlyTrends, loading, error } = useHourlyTrends(selectedStation, { filters });


    // Get labels and data for the chart
    const labels = hourlyTrends.map(row => row.hour.toString().padStart(2, '0') + ":00");
    const data = hourlyTrends.map(row => row.average_detections);

    // Assemble chart data and display options
    const chartData = {
        labels,
        datasets: [{
            label: 'Average Detections',
            data,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            datalabels: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y} detections`
                }
            }
        },
        scales: {
            x: { type: 'category', title: { display: true, text: 'Hour of Day' } },
            y: { title: { display: true, text: 'Number of Detections' } }
        }
    };

    return (
        <ComponentCard title="Average Activity Per Hour">
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
                data.length > 0 ? (

                    /* Line chart displaying hourly trends */
                    <Line 
                        key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                        data={chartData} 
                        options={options} />
                ) : (
                    <div className="text-center text-muted">No detection data available</div>
                )
            )}
        </ComponentCard>
    );
}