import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Line } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";

export default function DailyTotalsChart({ trendData, loading, error }) {
    const labels = trendData.map(row => row.hour.toString().padStart(2, '0') + ":00");
    const data = trendData.map(row => row.average_detections);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Average Detections',
                data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
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
        <ComponentCard title="Average Activity Per Hour (Last 7 Days)">
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? renderSkeleton() : (
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