import React, { useEffect, useState, useContext } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useSpeciesTrends from '../../hooks/useSpeciesTrends';
import TrendsCard from './TrendsCard';
import CompositionCard from './CompositionCard';
import axios from 'axios';
//import HeatmapChart from './HeatmapChart'; // assume a custom component for heatmap

function AnalyticsDashboard({ stationId }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { speciesTrends, loading: speciesLoading, error: speciesError } = useSpeciesTrends(selectedStation);

    //const [compositionData, setCompositionData] = useState(null);
    const [deltaStats, setDeltaStats] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);
    const [confidenceData, setConfidenceData] = useState(null);

    useEffect(() => {
        const headers = { Authorization: `Bearer ${localStorage.getItem('jwt')}` };

        axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/composition/${stationId}`, { headers })
        .then(res => setCompositionData(res.data))
        .catch(console.error);

        axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/delta/${stationId}`, { headers })
        .then(res => setDeltaStats(res.data))
        .catch(console.error);

        axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/heatmap/${stationId}`, { headers })
        .then(res => setHeatmapData(res.data))
        .catch(console.error);

        axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/top-confidence/${stationId}`, { headers })
        .then(res => setConfidenceData(res.data))
        .catch(console.error);
    }, [stationId]);

    return (
        <div className="container-fluid mt-4">

        {/*}
        <Row>
            <Col md={3}>
            <Card body className="text-center">
                <h5>Total Detections</h5>
                <p>{deltaStats.total_detections.current}</p>
                <small className="text-muted">
                {deltaStats.total_detections.delta > 0 ? '⬆️' : '⬇️'} {Math.abs(deltaStats.total_detections.delta)}%
                </small>
            </Card>
            </Col>
            <Col md={3}>
            <Card body className="text-center">
                <h5>Species Count</h5>
                <p>{deltaStats.unique_species.current}</p>
                <small className="text-muted">
                {deltaStats.unique_species.delta > 0 ? '⬆️' : '⬇️'} {Math.abs(deltaStats.unique_species.delta)}%
                </small>
            </Card>
            </Col>
            <Col md={3}>
            <Card body className="text-center">
                <h5>Top Species</h5>
                <p>{deltaStats.top_species.common_name}</p>
            </Card>
            </Col>
            <Col md={3}>
            <Card body className="text-center">
                <h5>Avg Confidence</h5>
                <p>{deltaStats.avg_confidence.toFixed(2)}</p>
            </Card>
            </Col>
        </Row>
        */}
        <Row className="mt-4">
            <Col md={6}>
                <TrendsCard 
                    trendData={speciesTrends} 
                    loading={speciesLoading} 
                    error={speciesError} 
                />
            </Col>
            <Col md={6}>
                <CompositionCard 
                    compositionData={speciesTrends} 
                    loading={speciesLoading} 
                    error={speciesError} 
                />        
            </Col>
        </Row>
            
            {/*
        <Row className="mt-4">
            <Col md={6}>
            <Card body>
                <h5>Top Species by Confidence</h5>
                <Pie data={confidenceData.chartData} options={confidenceData.options} />
            </Card>
            </Col>
            <Col md={6}>
            <Card body>
                <h5>Hourly Detection Heatmap</h5>
                <HeatmapChart data={heatmapData} />
            </Card>
            </Col>
        </Row>
        */}
        </div>
    );
}

export default AnalyticsDashboard;
