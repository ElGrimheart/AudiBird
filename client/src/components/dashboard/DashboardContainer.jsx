import React, { useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useStationStatus from '../../hooks/useStationStatus.jsx';
import useRecentDetections from '../../hooks/useRecentDetections.jsx';
import useCommonSpecies from '../../hooks/useCommonSpecies.jsx';
import useSummaryStats from '../../hooks/useSummaryStats.jsx';
import useStationSettings from '../../hooks/useStationSettings.jsx';
import StationCard from './StationCard.jsx';
import RecentDetectionsCard from './RecentDetectionsCard.jsx';
import CommonSpeciesCard from './CommonSpeciesCard.jsx';
import SummaryCard from './SummaryCard.jsx';

/* 
Main DashboardContainer component that assembles and controls layout of the dashboard cards.
Fetches data, loading and error states from the applicable hooks and passes it to the respective card components.
*/
export default function DashboardContainer() {   
    const { selectedStation } = useContext(SelectedStationContext);
    const navigate = useNavigate();

    // Card data hooks
    const { stationStatus, loading: statusLoading, error: statusError } = useStationStatus(selectedStation);
    const { recentDetections, loading: detectionsLoading, error: detectionsError, refetch: refreshDetections } = useRecentDetections(selectedStation, 10);
    const { commonSpecies, loading: speciesLoading, error: speciesError, refetch: refreshCommonSpecies } = useCommonSpecies(selectedStation, 5);
    const { summaryStats, loading: summaryLoading, error: summaryError, refetch: refreshSummaryStats } = useSummaryStats(selectedStation);
    const { stationSettings } = useStationSettings(selectedStation);

    return (
        selectedStation != null || selectedStation != "" ? 
            <Container className="p-4">
            {/* Row 1: Station Status + Detection Summary */}
            <Row className="mb-4">
                <Col md={6}>
                    <StationCard 
                        stationStatus={stationStatus} 
                        loading={statusLoading} 
                        error={statusError} 
                        stationSettings={stationSettings}
                    />
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
                        refreshDetections={refreshDetections}
                        refreshCommonSpecies={refreshCommonSpecies}
                        refreshSummaryStats={refreshSummaryStats}
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

        </Container>
        :
        <Container className="text-center mt-5">
            <Button
                variant="success"
                type="button"
                size="lg"
                onClick={() => navigate('/register-station')}
            >
                Click here <br/>to register <br/>your first station!
            </Button>
        </Container>
    )
}