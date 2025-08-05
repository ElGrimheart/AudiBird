import React, { useContext, useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
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

    function handleCloseSidebar() {
        setShowSidebar(false);
    }

    function handleShowSidebar() {
        setShowSidebar(true);
    }

    useEffect(() => {
        fetchDetections(filters);
    }, [fetchDetections, filters]);

    async function handleFilterSubmit(values, { setSubmitting }) {
        setFilters(values);
        await fetchDetections(values);
        setShowSidebar(false);
        setSubmitting(false);
    }

    return (
        <Container className="p-4">
            <Button variant="primary" className="mb-3" onClick={handleShowSidebar}>
                Show Filters
            </Button>
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
        </Container>
    );
}