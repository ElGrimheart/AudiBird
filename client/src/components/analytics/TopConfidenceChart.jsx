import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Pie } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ArcElement, Tooltip, Legend);
Chart.register(ChartDataLabels);

export default function TopConfidenceChart({ topConfidenceData, loading, error }) {
    
    // Prepare data for Pie chart
    const chartData = {
        labels: topConfidenceData.map(row => row.common_name),
        datasets: [{
            data: topConfidenceData.map(row => row.avg_confidence),
            backgroundColor: topConfidenceData.map((_, i) => `hsl(${i * 40}, 70%, 50%)`),
            hoverOffset: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'right' },
            datalabels: {
                display: true,
                color: '#fff',
                font: { weight: 'bold' },
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => Number(a) + Number(b), 0);
                    const percent = ((value / total) * 100).toFixed(0);
                    return `${percent}%`;
                }
            }
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
        <ComponentCard title="Top Confidence Species">
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? renderSkeleton() : (
                <Pie
                    data={chartData}
                    options={chartOptions}
                    plugins={{ ChartDataLabels }}
                />
            )}
        </ComponentCard>
    );
}