import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import useFilteredDetections from '../../hooks/useFilteredDetections';
import DetectionsFilterSidebar from './DetectionsFilterSidebar';
import FilteredDetections from './FilteredDetections';

const stationId = '149cd7cd-350e-4a84-a3dd-f6d6b6afaf5f';

// DetectionsContent component to manage the display of detections with filtering options
const DetectionsContent = () => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        species: '',
        min_confidence: '',
        max_confidence: '',
        sort_by: 'detection_timestamp',
        sort: 'desc'
    });
    const [detections, fetchDetections] = useFilteredDetections(stationId);

    const handleCloseSidebar = () => setShowSidebar(false);
    const handleShowSidebar = () => setShowSidebar(true);

    useEffect(() => {
        fetchDetections({});
    }, [fetchDetections]);

    const handleFilterSubmit = (values, { setSubmitting }) => {
        fetchDetections(values);
        setShowSidebar(false);
        setSubmitting(false);
        setFilters(values);
    };

    return (
        <Container fluid className="p-4">
            <Button variant="primary" className="mb-3" onClick={handleShowSidebar}>
                Show Filters
            </Button>
            <DetectionsFilterSidebar
                show={showSidebar}
                onHide={handleCloseSidebar}
                filters={filters}
                onFilterSubmit={handleFilterSubmit}
            />
            <FilteredDetections detections={detections} />
        </Container>
    );
};

export default DetectionsContent;