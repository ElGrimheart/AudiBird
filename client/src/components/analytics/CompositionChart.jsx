import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);
import { Bar } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";

export default function CompositionChart({ compositionData, loading, error }) {
    const dates = [...new Set(compositionData.map(row => row.date))];
    const speciesData = {};

    dates.forEach(date => {
        const dailyData = compositionData.filter(row => row.date === date);
        const total = dailyData.reduce((sum, row) => sum + parseInt(row.count, 0), 0);
        dailyData.forEach(row => {
            if (!speciesData[row.common_name]) {
                speciesData[row.common_name] = Array(dates.length).fill(0);
            }
            const dateIndex = dates.indexOf(date);
            speciesData[row.common_name][dateIndex] += parseInt(row.count, 0)*100 / total;
        });
    });

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
        <ComponentCard title="Species Composition">
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? renderSkeleton() : (
                <Bar
                    key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                    data={chartData}
                    options={chartOptions}
                />
            )}
        </ComponentCard>
    );
}