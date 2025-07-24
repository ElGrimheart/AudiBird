import React, { useContext, useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useFilteredDetections from '../../hooks/useFilteredDetections';
import DetectionsFilterSidebar from './DetectionsFilterSidebar';
import { useFilters } from '../../hooks/useFilters';
import FilteredDetections from './FilteredDetections';


// DetectionsContent component to manage the display of detections with filtering options
const DetectionsContent = () => {
    const { selectedStation } = useContext(SelectedStationContext);

    const { filters, setFilters } = useFilters();
    const [detections, fetchDetections, error] = useFilteredDetections(selectedStation, filters);
    const [showSidebar, setShowSidebar] = useState(false);

    const handleCloseSidebar = () => setShowSidebar(false);
    const handleShowSidebar = () => setShowSidebar(true);

    useEffect(() => {
        fetchDetections(filters);
    }, [fetchDetections, filters]);

    const handleFilterSubmit = async(values, { setSubmitting }) => {
        setFilters(values);
        await fetchDetections(values);
        setShowSidebar(false);
        setSubmitting(false);
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
                error={error}
            />
            <FilteredDetections detections={detections} />
        </Container>
    );
};

export default DetectionsContent;