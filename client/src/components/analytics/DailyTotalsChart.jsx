import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Line } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";

export default function DailyTotalsChart({ dailyData, loading, error }) {

    // Get days for x-axis labels
    const dates = [...new Set(dailyData.map(row => row.date))];

    // Group counts by species
    const speciesMap = {};
    dailyData.forEach(row => {
    if (!speciesMap[row.common_name]) {
        speciesMap[row.common_name] = Array(dates.length).fill(0);
    }
    const dateIndex = dates.indexOf(row.date);
    speciesMap[row.common_name][dateIndex] = Number(row.count);
    });

    // Build datasets for Chart.js
    const chartData = {
        labels: dates.map(date => new Date(date).toLocaleDateString()),
        datasets: Object.entries(speciesMap).map(([species, detections], i) => ({
            label: species,
            data: detections,
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

    function renderSkeleton() {
        return (
            <div>
                <div style={{ height: "200px", position: "relative" }}>
                    <Skeleton height="100%" />
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </div>
        );
    }

    return (
        <ComponentCard title="Daily Species Activity">
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? renderSkeleton() : (
                <Line 
                    key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                    data={chartData} 
                    options={chartOptions} 
                />
            )}
        </ComponentCard>
    );
}