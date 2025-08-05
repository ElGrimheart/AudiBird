import React, { useState, useContext} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useRecentDetections from '../../hooks/useRecentDetections.jsx';
import useCommonSpecies from '../../hooks/useCommonSpecies.jsx';
import useSummaryStats from '../../hooks/useSummaryStats.jsx';
import useHourlyTrends from '../../hooks/useHourlyTrends.jsx';
import StationCard from './StationCard.jsx';
import MicStreamCard from './MicStreamCard.jsx';
import RecentDetectionsCard from './RecentDetectionsCard.jsx';
import CommonSpeciesCard from './CommonSpeciesCard.jsx';
import AverageDetectionsCard from './AverageDetectionsCard.jsx';
import SummaryCard from './SummaryCard.jsx';

// DashboardContent component to manage the dashboard layout and pass data to cards
export default function DashboardContainer() {
    const { selectedStation } = useContext(SelectedStationContext);
    const [filters] = useState({ startDate: null, endDate: null, species: [] });

    // Card data hooks
    const { recentDetections, loading: detectionsLoading, error: detectionsError } = useRecentDetections(selectedStation);
    const { commonSpecies, loading: speciesLoading, error: speciesError } = useCommonSpecies(selectedStation);
    const { summaryStats, loading: summaryLoading, error: summaryError } = useSummaryStats(selectedStation);
    const { hourlyTrends, loading: trendsLoading, error: trendsError } = useHourlyTrends(selectedStation, { filters });

    // Mic stream handlers
    const [isStreamPlaying, setIsStreamPlaying] = useState(false);
    const handleStreamPlay = () => setIsStreamPlaying(true);
    const handleStreamPause = () => setIsStreamPlaying(false);

    return (
        selectedStation != null ? 
            <Container className="p-4">
            {/* Row 1: Station Status + Audio Player */}
            <Row className="mb-4">
                <Col md={6}>
                    <StationCard station={{ name: "Station 1", description: "Main field station", isActive: true }} />
                </Col>
                <Col md={6}>
                    <SummaryCard 
                        summaryData={summaryStats}
                        loading={summaryLoading}
                        error={summaryError}
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
            <Row className="mb-4">
                <Col>
                    <MicStreamCard
                        isPlaying={isStreamPlaying}
                        onPlay={handleStreamPlay}
                        onPause={handleStreamPause}
                    />
                </Col>
            </Row>

            {/* Row 4: Activity Chart */}
            <Row className="mb-4">
                <Col>
                    <AverageDetectionsCard 
                        detectionData={hourlyTrends}
                        loading={trendsLoading}
                        error={trendsError}
                    />
                </Col>
            </Row>

        </Container>
        :
        <Container className="text-center mt-5">
            <h2>Click here to register a station</h2>
        </Container>
    )
}