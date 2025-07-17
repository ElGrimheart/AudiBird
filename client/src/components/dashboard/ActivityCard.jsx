import React from "react";
import DashboardCard from "./DashboardCard";
import { Line } from "react-chartjs-2";
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

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Legend
);

const ActivityCard = ({ chartData }) => {
    // Fallback if chartData is missing or malformed
    if (!chartData || !chartData.datasets) {
        return (
            <DashboardCard title="Average Activity Per Hour (Last 7 Days)">
                No data available
            </DashboardCard>
        );
    }

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
                type: 'time',
                time: {
                    unit: 'hour',
                    tooltipFormat: 'MMM D, h:mm a'
                },
                min: '2025-07-04T00:00:00Z',
                max: '2025-07-04T23:00:00Z',
                title: {
                    display: true,
                    text: 'Time of Day'
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
            <Line data={chartData} options={options} />
        </DashboardCard>
    );
};

export default ActivityCard;