import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Pagination } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import DetectionsFilterSidebar from './DetectionsFilterSidebar';
import useDetectionFilters from '../../hooks/useDetectionFilters';
import useFilteredDetections from '../../hooks/useFilteredDetections';
import useVerifyDetection from "../../hooks/useVerifyDetection";
import useDeleteDetection from "../../hooks/useDeleteDetection";
import useReclassifyDetection from "../../hooks/useReclassifyDetection";
import useProtectAudio from "../../hooks/useProtectAudio";
import FilteredDetections from './FilteredDetections';
import { VERIFICATION_STATUS_TYPE, AUDIO_PROTECTION_STATUS_TYPE } from '../../constants/type-ids';

/*
DetectionsContent component to manage fetching and rendering detections.
Provides a sidebar for filtering options and pagination controls.
*/
export default function DetectionsContainer() {
    const { selectedStation } = useContext(SelectedStationContext);
    const [selectedDetection, setSelectedDetection] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(15);
    
    // Detection filter query hooks
    const offset = (page - 1) * pageSize;
    const { filters, setFilters } = useDetectionFilters();
    const [detections, fetchDetections, totalResults, error, loading] = useFilteredDetections(selectedStation, filters, pageSize, offset);
    
    // Modal hooks
    const { verifyDetection, loading: verifyLoading, error: verifyError } = useVerifyDetection();
    const { deleteDetection, loading: deleteLoading, error: deleteError } = useDeleteDetection();
    const { reclassifyDetection, loading: reclassifyLoading, error: reclassifyError } = useReclassifyDetection();
    const { protectAudio, loading: protecting, error: protectError } = useProtectAudio();


    // Fetch detections when filters change
    useEffect(() => {
        fetchDetections(filters, pageSize, offset)
    }, [fetchDetections, filters, page, pageSize, offset]);

    const handleFilterSubmit = async (values, { setSubmitting }) => {
        setFilters(values);
        setPage(1); // Reset to first page on new filter
        await fetchDetections(values, pageSize, 0);
        setShowSidebar(false);
        setSubmitting(false);
    };

    // Sidebar display toggle
    const handleCloseSidebar = () => {
        setShowSidebar(false);
    };

    const handleShowSidebar = () => {
        setShowSidebar(true);
    };

    // Modal button handlers
    const handleVerify = async (detectionId) => {
        const result = await verifyDetection(selectedStation, detectionId);
        if (result && !verifyError) {
            setSelectedDetection({
                ...selectedDetection,
                verification_status_id: VERIFICATION_STATUS_TYPE.Verified
            });
        }
        await fetchDetections(filters);
    };

    const handleDelete = async (detectionId) => {
        const result = await deleteDetection(selectedStation, detectionId);
        if (result && !deleteError) {
            setSelectedDetection(null);
            setShowModal(false);
        }
        await fetchDetections(filters);
    };

    const handleReclassify = async (stationId, detectionId, alternativePredictionId) => {
        await reclassifyDetection(stationId, detectionId, alternativePredictionId);
        setShowModal(false);
        setSelectedDetection(null);
        await fetchDetections(filters);
    };

    const handleProtectAudio = async (audioId, protect) => {
        if (selectedDetection) {
            setSelectedDetection({
                ...selectedDetection,
                protected: (protect ? AUDIO_PROTECTION_STATUS_TYPE.Protected : AUDIO_PROTECTION_STATUS_TYPE.Unprotected)
            });
            await protectAudio(selectedStation, audioId, protect);
            await fetchDetections(filters);
        }
    };

    // Pagination component
    function DetectionPagination({ page, pageSize, totalResults, onPageChange }) {
        const pageCount = Math.ceil(totalResults / pageSize);
        const maxButtons = 10; // Number of page buttons to show
        let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;

        if (endPage > pageCount) {
            endPage = pageCount;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        const pageNumbers = [];
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <Pagination>
                <Pagination.First onClick={() => onPageChange(1)} disabled={page === 1} />
                <Pagination.Prev onClick={() => onPageChange(page - 1)} disabled={page === 1} />
                {pageNumbers.map(num => (
                    <Pagination.Item
                        key={num}
                        active={page === num}
                        onClick={() => onPageChange(num)}
                    >
                        {num}
                    </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => onPageChange(page + 1)} disabled={page === pageCount} />
                <Pagination.Last onClick={() => onPageChange(pageCount)} disabled={page === pageCount} />
            </Pagination>
        );
    }


    // Main render
    return (
        <Container fluid className="p-4">
            <Row>
                <Col md={1}>
                    <Button variant="primary" onClick={handleShowSidebar}>
                        <i className="bi bi-chevron-double-right"></i>
                    </Button>
                </Col>
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
                        onVerify={handleVerify}
                        onDelete={handleDelete}
                        onReclassify={handleReclassify}
                        onProtectAudio={handleProtectAudio}
                        verifyLoading={verifyLoading}
                        deleteLoading={deleteLoading}
                        reclassifyLoading={reclassifyLoading}
                        verifyError={verifyError}
                        deleteError={deleteError}
                        reclassifyError={reclassifyError}
                        selectedDetection={selectedDetection}
                        protecting={protecting}
                        protectError={protectError}
                        setSelectedDetection={setSelectedDetection}
                        showModal={showModal}
                        setShowModal={setShowModal}
                    />
                    <div className="d-flex justify-content-center mt-3">
                        <DetectionPagination
                            page={page}
                            pageSize={pageSize}
                            totalResults={totalResults}
                            onPageChange={setPage}
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}