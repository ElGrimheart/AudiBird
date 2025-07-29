import React, { useState, useContext} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useRecentDetections from '../../hooks/useRecentDetections.jsx';
import useCommonSpecies from '../../hooks/useCommonSpecies.jsx';
import useSummaryStats from '../../hooks/useSummaryStats.jsx';
import useAverageDetections from '../../hooks/useAverageDetections.jsx';
import StationCard from './StationCard.jsx';
import MicStreamCard from './MicStreamCard.jsx';
import RecentDetectionsCard from './RecentDetectionsCard.jsx';
import CommonSpeciesCard from './CommonSpeciesCard.jsx';
import ActivityCard from './AverageDetectionsCard.jsx';
import SummaryCard from './SummaryCard.jsx';

// DashboardContent component to manage the dashboard layout and pass data to cards
const DashboardContainer = () => {
    const { selectedStation } = useContext(SelectedStationContext);

    // Card data hooks
    const { recentDetections, loading: detectionsLoading, error: detectionsError } = useRecentDetections(selectedStation);
    const { commonSpecies, loading: speciesLoading, error: speciesError } = useCommonSpecies(selectedStation);
    const { summaryStats, loading: summaryLoading, error: summaryError } = useSummaryStats(selectedStation);
    const { averageDetections, loading: averageLoading, error: averageError } = useAverageDetections(selectedStation, { startDate: "", endDate: "" });

    // Prepare data for activity chart
    const hours = Array.from({ length: 24 }, (_, i) => i); // [0, 1, ..., 23]
    const labels = hours.map(h => h.toString().padStart(2, '0') + ":00");
    const data = hours.map(h => {
        const found = averageDetections.find(row => row.hour_of_day === h);
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
                    <ActivityCard 
                        chartData={chartData}
                        loading={averageLoading}
                        error={averageError}
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

export default DashboardContainer;