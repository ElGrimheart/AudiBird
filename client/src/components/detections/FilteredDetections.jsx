import React, { useState } from 'react';
import RenderSkeleton from '../common/SkeletonPlaceholder';
import { Table } from "react-bootstrap";
import { formatStringToDate } from "../../utils/dateFormatter";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import DetectionModal from "../common/DetectionModal";

// Display a list of filtered detections based on user-selected criteria
export default function  FilteredDetections({ detections, loading, error }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedDetection, setSelectedDetection] = useState(null);

    function handleShowModal(detection) {
        setSelectedDetection(detection);
        setShowModal(true);
    }

    function handleCloseModal() {
        setShowModal(false);
        setSelectedDetection(null);
    }

    if (!detections || detections.length === 0) {
        return <div className="alert alert-info">No detections found matching your criteria.</div>;
    }

    return (
        <>
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <RenderSkeleton /> : (
                detections && detections.length > 0 ? (
                    <div>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Common Name <em>(Scientific Name)</em></th>
                                    <th>Confidence</th>
                                    <th>Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {detections.map(detection => (
                                        <tr
                                            key={detection.detection_id}
                                            onClick={() => handleShowModal(detection)}
                                            style={{ cursor: "pointer" }}
                                            tabIndex={0}
                                        >
                                            <td>{detection.common_name} 
                                                <em> ({detection.scientific_name}) </em>{" "}
                                                <a 
                                                    href={`${import.meta.env.VITE_API_EBIRD_URL}/${detection.species_code}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer">
                                                    <BoxArrowUpRight 
                                                        size={12} 
                                                        aria-label="external link" 
                                                        title="External link" 
                                                        style={{ marginLeft: 4 }} 
                                                /></a>
                                            </td>
                                            <td>{Math.round(detection.confidence * 100)}%</td>
                                            <td>{formatStringToDate(detection.detection_timestamp)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                        </Table>

                        <DetectionModal
                            show={showModal}
                            onHide={handleCloseModal}
                            detection={selectedDetection}
                        />
                    </div>
                ) : (
                    <div className="text-center text-muted">
                        No detections found.
                    </div>
                )
            )}
        </>
    );
}