import React, { useEffect, useState, useContext } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useSpeciesTrends from '../../hooks/useSpeciesTrends';
import useDeltas from '../../hooks/useDeltas';
import TrendsCard from './TrendsCard';
import CompositionCard from './CompositionCard';
import axios from 'axios';
//import HeatmapChart from './HeatmapChart'; // assume a custom component for heatmap

function AnalyticsDashboard({ stationId }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { speciesTrends, loading: speciesLoading, error: speciesError } = useSpeciesTrends(selectedStation);
    const { deltas, loading: deltasLoading, error: deltasError } = useDeltas(selectedStation, {startDate: null, endDate: null, speciesName: null, minConfidence: null});
    console.log("Deltas:", deltas); 

        //const [compositionData, setCompositionData] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);
    const [confidenceData, setConfidenceData] = useState(null);

    useEffect(() => {
        const headers = { Authorization: `Bearer ${localStorage.getItem('jwt')}` };

        axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/heatmap/${stationId}`, { headers })
        .then(res => setHeatmapData(res.data))
        .catch(console.error);

        axios.get(`${import.meta.env.VITE_API_ANALYTICS_URL}/top-confidence/${stationId}`, { headers })
        .then(res => setConfidenceData(res.data))
        .catch(console.error);
    }, [stationId]);

    return (
        <div className="container-fluid mt-4">
        <h2 className="mb-4">This week in AudiBird</h2>
        <Row>
            {deltasLoading ? (
                <Col>
                <div className="text-center my-4">
                    <Spinner animation="border" role="status" />
                </div>
                </Col>
            ) : deltasError ? (
                <Col>
                <div className="text-danger text-center my-4">
                    Error loading deltas.
                </div>
                </Col>
            ) : (
                <>
                <Col md={3}>
                    <Card body className="text-center">
                    <h5>Total Detections</h5>
                    <p>{deltas.total_detections?.current}</p>
                    <small className="text-muted">
                        {deltas.total_detections?.delta > 0 ? '⬆️' : '⬇️'} {Math.abs(deltas.total_detections?.delta).toFixed(0)}%
                    </small>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card body className="text-center">
                    <h5>Species Count</h5>
                    <p>{deltas.total_species?.current}</p>
                    <small className="text-muted">
                        {deltas.total_species?.delta > 0 ? '⬆️' : '⬇️'} {Math.abs(deltas.total_species?.delta).toFixed(0)}%
                    </small>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card body className="text-center">
                    <h5>Top Species</h5>
                    <p>{deltas.top_species?.current}</p>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card body className="text-center">
                    <h5>Avg Confidence</h5>
                    <p>{(Number(deltas.confidence?.current).toFixed(2)*100).toFixed(0)}%</p>
                    </Card>
                </Col>
                </>
            )}
        </Row>
         
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
