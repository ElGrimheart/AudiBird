import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DashboardCard from "./DashboardCard";
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

const ActivityCard = ({ chartData, loading, error }) => {

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
            <DashboardCard title="Average Detections Per Hour (Last 7 Days)">
                <div className="text-danger">Error loading chart data</div>
            </DashboardCard>
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
        <DashboardCard title="Average Activity Per Hour (Last 7 Days)">
            {loading ? renderSkeleton() : (
                (!chartData || !chartData.datasets) ? (
                    <div>No data available</div>
                ) : (
                    <Line data={chartData} options={options} />
                )
            )}
        </DashboardCard>
    );
};

export default ActivityCard;