import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Line } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";

const TrendsCard = ({ trendData, loading, error }) => {
    console.log("TrendsCard data:", trendData);
    // Get days (x-axis)
    const dates = [...new Set(trendData.map(row => row.date))];

    // Group counts by species
    const speciesMap = {};
    trendData.forEach(row => {
    if (!speciesMap[row.common_name]) {
        speciesMap[row.common_name] = Array(dates.length).fill(0);
    }
    const dateIndex = dates.indexOf(row.date);
    speciesMap[row.common_name][dateIndex] = Number(row.count);
    });

    // Build datasets for Chart.js
    const chartData = {
    labels: dates.map(date => new Date(date).toLocaleDateString()),
    datasets: Object.entries(speciesMap).map(([species, data], i) => ({
        label: species,
        data,
        borderColor: `hsl(${i * 40}, 70%, 50%)`,
        backgroundColor: `hsla(${i * 40}, 70%, 50%, 0.2)`,
        fill: false,
        tension: 0.3
    }))
    };

    const chartOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Species Activity Trends' }
    },
    scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Detections' }, beginAtZero: true }
    }
    };

    if (error) {
        return (
            <ComponentCard title="Species Activity Trends">
                <div className="text-danger">Error loading chart data</div>
            </ComponentCard>
        );
    }

    if (loading) {
        return (
            <ComponentCard title="Species Activity Trends">
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                <div style={{ height: "200px" }}>
                    <Skeleton height="100%" />
                </div>
            </ComponentCard>
        );
    }

    return (
        <ComponentCard title="Species Activity Trends">
            <Line 
                key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                data={chartData} 
                options={chartOptions} />
        </ComponentCard>
    );
}

export default TrendsCard;
