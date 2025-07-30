import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);
import { Bar } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";

const CompositionCard = ({ compositionData, loading, error }) => {
    console.log("CompositionCard data:", compositionData);
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
            speciesData[row.common_name][dateIndex] += parseInt(row.count, 0) / total;
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
            legend: { position: 'top' },
            title: { display: true, text: 'Species Composition' }
        },
        scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Proportion' }, beginAtZero: true }
        }
    };

    if (error) {
        return (
            <ComponentCard title="Species Composition">
                <div className="text-danger">Error loading chart data</div>
            </ComponentCard>
        );
    }

    if (loading) {
        return (
            <ComponentCard title="Species Composition">
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </ComponentCard>
        );
    }

    // Only render chart if there is data
    return (
        <ComponentCard title="Species Composition">
            <Bar 
                key={JSON.stringify(chartData.labels) + JSON.stringify(chartData.datasets.map(ds => ds.label))}
                data={chartData} 
                options={chartOptions} />
        </ComponentCard>
    );
};

export default CompositionCard;