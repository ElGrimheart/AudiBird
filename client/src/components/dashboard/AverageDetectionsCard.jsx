import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Line } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

const AverageDetectionsCard = ({ detectionData, loading, error }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const labels = hours.map(h => h.toString().padStart(2, '0') + ":00");
    const data = hours.map(h => {
        const found = detectionData.find(row => row.hour_of_day === h);
        return found ? found.average_detections : 0;
    });
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


    const renderSkeleton = () => {
        return (
            <div>
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                <div style={{ height: "200px" }}>
                    <Skeleton height="100%" />
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <ComponentCard title="Average Detections Per Hour (Last 7 Days)">
                <div className="text-danger">Error loading chart data</div>
            </ComponentCard>
        );
    }

    ChartJS.register(
        LineElement,
        PointElement,
        LinearScale,
        TimeScale,
        CategoryScale,
        Tooltip,
        Legend
    );

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y} detections`
                }
            }
        },
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Hour of Day'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Detections'
                }
            }
        }
};

    return (
        <ComponentCard title="Average Activity Per Hour (Last 7 Days)">
            {loading ? renderSkeleton() : (
                (!chartData || !chartData.datasets) ? (
                    <div>No data available</div>
                ) : (
                    <Line data={chartData} options={options} />
                )
            )}
        </ComponentCard>
    );
};

export default AverageDetectionsCard;