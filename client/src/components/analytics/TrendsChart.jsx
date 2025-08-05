import React, { useContext } from "react";
import { Line } from "react-chartjs-2";
import ChartFilterBar from "./ChartFilterBar.jsx";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import useHourlyTrends from "../../hooks/useHourlyTrends.jsx";
import SkeletonComponent from "../common/SkeletonPlaceholder.jsx";
import ComponentCard from "../common/ComponentCard.jsx";

// SpeciesTrendsChart component to display trends of species detections over time
// It uses a line chart to visualize the average number of detections per hour for the selected station
// Filters can be applied to adjust the date range and species selection
export default function TrendsChart({ filters, setFilters }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { hourlyTrends, loading, error } = useHourlyTrends(selectedStation, { filters });


    // Prepare data and display options for the line chart
    const labels = hourlyTrends.map(row => row.hour.toString().padStart(2, '0') + ":00");
    const data = hourlyTrends.map(row => row.average_detections);

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
            <ChartFilterBar
                filters={filters}
                setFilters={setFilters}
                showDateRange={true}
                showSpeciesSelect={true}
                showMinConfidence={true}
            />
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (
                data.length > 0 ? (
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