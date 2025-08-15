import React, { useState } from 'react';
import RenderSkeleton from '../common/SkeletonPlaceholder';
import { Table } from "react-bootstrap";
import { formatStringToDate } from "../../utils/date-formatter";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import DetectionModal from "../common/DetectionModal";
import * as externalLink from '../../constants/external-links';

/* 
FilteredDetections component to display a list of detections based on applied filters.
Includes a table view with detection details and a modal for more information on each detection. 
*/
export default function  FilteredDetections({ detections, loading, error }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedDetection, setSelectedDetection] = useState(null);

    const handleShowModal = (detection) => {
        setSelectedDetection(detection);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDetection(null);
    };

    if (!detections || detections.length === 0) {
        return <div className="alert alert-info">No detections found matching your criteria.</div>;
    }

    return (
        <>
            {/* Error and loading state handling */}
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <RenderSkeleton /> : (
                detections && detections.length > 0 ? (
                    <div>

                        {/* Render detections table */}
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
                                                    href={`${externalLink.EXTERNAL_SPECIES_URL}/${detection.species_code}`} 
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