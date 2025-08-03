import React, { useContext } from 'react';
import { Container, Row, Col, Tabs, Tab, Spinner } from 'react-bootstrap';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useDeltas from '../../hooks/useDeltas';
import useSpeciesDailyTotals from '../../hooks/useSpeciesDailyTotals';
import useSpeciesTrends from '../../hooks/useSpeciesTrends';
import useTopConfidenceSpecies from '../../hooks/useTopConfidenceSpecies';
import ComponentCard from '../common/ComponentCard';
import DailyTotalsChart from './DailyTotalsChart';
import CompositionChart from './CompositionChart';
import SpeciesTrendsChart from './SpeciesTrendsChart';
import TopConfidenceChart from './TopConfidenceChart';

export default function AnalyticsDashboard() {
    const { selectedStation } = useContext(SelectedStationContext);

    // Card data hooks
    const { deltas, loading: deltasLoading, error: deltasError } = useDeltas(selectedStation, {startDate: null, endDate: null, speciesName: null, minConfidence: null});
    const { speciesDailyTotals, loading: speciesLoading, error: speciesError } = useSpeciesDailyTotals(selectedStation);
    const { speciesTrends, loading: trendsLoading, error: trendsError } = useSpeciesTrends(selectedStation);
    const { topConfidenceSpecies, loading: confidenceLoading, error: confidenceError } = useTopConfidenceSpecies(selectedStation, { startDate: null, endDate: null, limit: null });

    return (
        <Container className="p-4">
            <Row>
                <Col md={3}>
                    <ComponentCard title="Total Detections">
                        <p>{deltas.total_detections?.current}</p>
                        <small className="text-muted">
                        {deltas.total_detections?.delta > 0 ? '⬆️' : '⬇️'} {Math.abs(deltas.total_detections?.delta).toFixed(0)}%
                        </small>
                    </ComponentCard>
                </Col>
                <Col md={3}>
                <ComponentCard title="Species Count">
                    <p>{deltas.total_species?.current}</p>
                    <small className="text-muted">
                    {deltas.total_species?.delta > 0 ? '⬆️' : '⬇️'} {Math.abs(deltas.total_species?.delta).toFixed(0)}%
                    </small>
                </ComponentCard>
                </Col>
                <Col md={3}>
                <ComponentCard title="Top Species">
                    <p>{deltas.top_species?.current}</p>
                </ComponentCard>
                </Col>
                <Col md={3}>
                <ComponentCard title="Avg Confidence">
                    <p>
                    {deltas.confidence?.current != null && !isNaN(Number(deltas.confidence.current))
                        ? (Number(deltas.confidence.current) * 100).toFixed(0) + '%'
                        : '--'}
                    </p>
                </ComponentCard>
                </Col>
            </Row>

            <Row className="mt-4">
                <Tabs defaultActiveKey="trends" id="species-analytics-tabs" className="mb-3" fill>
                    <Tab eventKey="trends" title="Species Trends">
                        <SpeciesTrendsChart 
                            trendData={speciesTrends} 
                            loading={trendsLoading} 
                            error={trendsError} 
                        />
                    </Tab>
                    <Tab eventKey="daily" title="Species Daily Totals">
                        <DailyTotalsChart 
                            dailyData={speciesDailyTotals} 
                            loading={speciesLoading} 
                            error={speciesError} 
                    />
                    </Tab>
                    <Tab eventKey="composition" title="Composition">
                        <CompositionChart 
                            compositionData={speciesDailyTotals} 
                            loading={speciesLoading} 
                            error={speciesError} 
                        />
                    </Tab>
                    <Tab eventKey="top" title="Top Species">
                        <TopConfidenceChart 
                            topConfidenceData={topConfidenceSpecies} 
                            loading={confidenceLoading} 
                            error={confidenceError} 
                        />
                    </Tab>
                </Tabs>
            </Row>
            
            <Row className="mt-4">
                <Col>
                    <DailyTotalsChart 
                        dailyData={speciesDailyTotals} 
                        loading={speciesLoading} 
                        error={speciesError} 
                    />
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <CompositionChart 
                        compositionData={speciesDailyTotals} 
                        loading={speciesLoading} 
                        error={speciesError} 
                    />        
                </Col>
            </Row>
                
                
            <Row className="mt-4">
                <Col>
                    <TopConfidenceChart 
                        topConfidenceData={topConfidenceSpecies} 
                        loading={confidenceLoading} 
                        error={confidenceError} 
                    />
                </Col>
            </Row>
        </Container>
    );
}