import React from "react";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";
import { Line } from "react-chartjs-2";
import 'chartjs-adapter-date-fns';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip, Legend);

export default function AverageDetectionsCard({ detectionData, loading, error }) {
    // Prepare data for Line chart
    const labels = detectionData.map(row => row.hour.toString().padStart(2, '0') + ":00");
    const data = detectionData.map(row => row.average_detections);

    // Build chart data
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Average Detections',
                data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
            }
        ]
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
        <ComponentCard title="Average Activity Per Hour (Last 7 Days)">
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (
                (data.length > 0) ? (
                    <Line
                        key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                        data={chartData}
                        options={options}
                    />
                ) : (
                    <div className="text-center text-muted">
                        No detection data available
                    </div>
                )
            )}
        </ComponentCard>
    );
}