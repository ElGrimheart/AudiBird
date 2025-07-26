import React, { useState, useContext} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useRecentDetections from '../../hooks/useRecentDetections.jsx';
import useCommonSpecies from '../../hooks/useCommonSpecies.jsx';
import useSummaryStats from '../../hooks/useSummaryStats.jsx';
import StationCard from './StationCard.jsx';
import MicStreamCard from './MicStreamCard.jsx';
import RecentDetectionsCard from './RecentDetectionsCard.jsx';
import CommonSpeciesCard from './CommonSpeciesCard.jsx';
import ActivityCard from './ActivityCard.jsx';
import SummaryCard from './SummaryCard.jsx';

// DashboardContent component to manage the dashboard layout and pass data to cards
const DashboardContainer = () => {
    const { selectedStation } = useContext(SelectedStationContext);

    // Card data hooks
    const { recentDetections, loading: detectionsLoading, error: detectionsError } = useRecentDetections(selectedStation);
    const { commonSpecies, loading: speciesLoading, error: speciesError } = useCommonSpecies(selectedStation);
    const { summaryStats, loading: summaryLoading, error: summaryError } = useSummaryStats(selectedStation);

    // Mic stream handlers
    const [isStreamPlaying, setIsStreamPlaying] = useState(false);
    const handleStreamPlay = () => setIsStreamPlaying(true);
    const handleStreamPause = () => setIsStreamPlaying(false);

    return (
        selectedStation != null ? 
            <Container fluid className="p-4">
            {/* Row 1: Station Status + Audio Player */}
            <Row className="mb-4">
                <Col md={6}>
                    <StationCard station={{ name: "Station 1", description: "Main field station", isActive: true }} />
                </Col>
                <Col md={6}>
                    <MicStreamCard
                        isPlaying={isStreamPlaying}
                        onPlay={handleStreamPlay}
                        onPause={handleStreamPause}
                    />
                </Col>
            </Row>

            {/* Row 2: Recent Detections + Top Species */}
            <Row className="mb-4">
                <Col md={6}>
                    <RecentDetectionsCard 
                        detectionsData={recentDetections}
                        loading={detectionsLoading}
                        error={detectionsError}
                    />
                </Col>
                <Col md={6}>
                    <CommonSpeciesCard 
                        speciesData={commonSpecies}
                        loading={speciesLoading}
                        error={speciesError}
                    />
                </Col>
            </Row>

            {/* Row 3: Summary Stats Cards */}
            <Row>
                <Col>
                    <SummaryCard 
                        summaryData={summaryStats}
                        loading={summaryLoading}
                        error={summaryError}
                    />
                </Col>
            </Row>

            {/* Row 4: Activity Chart */}
            <Row>
                <Col>
                    <ActivityCard chartData={{
                        labels: ['Detections'],
                        datasets: [
                            {
                                label: 'Detections',
                                data: [
                                    { x: '2025-07-04T00:00:00Z', y: 5 },
                                    { x: '2025-07-04T01:00:00Z', y: 10 },
                                    { x: '2025-07-04T02:00:00Z', y: 15 },
                                    { x: '2025-07-04T03:00:00Z', y: 2 },
                                    { x: '2025-07-04T04:00:00Z', y: 65 },
                                    { x: '2025-07-04T05:00:00Z', y: 30 },
                                    { x: '2025-07-04T06:00:00Z', y: 16 },
                                    { x: '2025-07-04T07:00:00Z', y: 8 },
                                    { x: '2025-07-04T08:00:00Z', y: 12 },
                                    { x: '2025-07-04T09:00:00Z', y: 20 },
                                    { x: '2025-07-04T10:00:00Z', y: 25 },
                                    { x: '2025-07-04T11:00:00Z', y: 18 },
                                    { x: '2025-07-04T12:00:00Z', y: 22 },
                                    { x: '2025-07-04T13:00:00Z', y: 4 },
                                    { x: '2025-07-04T14:00:00Z', y: 15 },
                                    { x: '2025-07-04T15:00:00Z', y: 63 },
                                    { x: '2025-07-04T16:00:00Z', y: 43 },
                                    { x: '2025-07-04T17:00:00Z', y: 24 },
                                    { x: '2025-07-04T18:00:00Z', y: 34 },
                                    { x: '2025-07-04T19:00:00Z', y: 13 },
                                    { x: '2025-07-04T20:00:00Z', y: 5 },
                                    { x: '2025-07-04T21:00:00Z', y: 5 },
                                    { x: '2025-07-04T22:00:00Z', y: 2 },
                                    { x: '2025-07-04T23:00:00Z', y: 5 }
                                ]
                            }
                        ]
                    }
                } />
                </Col>
            </Row>
        </Container>
        :
        <Container className="text-center mt-5">
            <h2>Click here to register a station</h2>
        </Container>

    )
}

export default DashboardContainer;