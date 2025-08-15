import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import DetectionsFilterSidebar from './DetectionsFilterSidebar';
import useDetectionFilters from '../../hooks/useDetectionFilters';
import useFilteredDetections from '../../hooks/useFilteredDetections';
import FilteredDetections from './FilteredDetections';

// DetectionsContent component to manage the display of detections with filtering options
export default function DetectionsContainer() {
    const { selectedStation } = useContext(SelectedStationContext);

    // Filter hooks
    const { filters, setFilters } = useDetectionFilters();
    const [detections, fetchDetections, error, loading] = useFilteredDetections(selectedStation, filters);
    const [showSidebar, setShowSidebar] = useState(false);

    // Sidebar display toggle
    const handleCloseSidebar = () => {
        setShowSidebar(false);
    };

    const handleShowSidebar = () => {
        setShowSidebar(true);
    };

    // Fetch detections when filters change
    useEffect(() => {
        fetchDetections(filters);
    }, [fetchDetections, filters]);

    const handleFilterSubmit = async (values, { setSubmitting }) => {
        setFilters(values);
        await fetchDetections(values);
        setShowSidebar(false);
        setSubmitting(false);
    };

    return (
        <Container className="p-4">
            <Row>
                <Col md={11}>
                    <DetectionsFilterSidebar
                        show={showSidebar}
                        onHide={handleCloseSidebar}
                        filters={filters}
                        onFilterSubmit={handleFilterSubmit}
                        error={error}
                    />
                    <FilteredDetections
                        detections={detections}
                        loading={loading}
                        error={error}
                    />
                </Col>

                <Col md={1}>
                    <Button variant="success" onClick={handleShowSidebar}>
                        <i className="bi bi-filter"></i>
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}