import React from 'react';
import RenderSkeleton from '../common/SkeletonPlaceholder';
import { Table, Badge } from "react-bootstrap";
import { formatStringToDate } from "../../utils/date-formatter";
import { VERIFICATION_STATUS_TYPE, AUDIO_PROTECTION_STATUS_TYPE } from '../../constants/type-ids';
import DetectionModal from "../common/DetectionModal";

/* 
FilteredDetections component to display a list of detections based on applied filters.
Includes a table view with detection details and a modal for more information on each detection. 
*/
export default function  FilteredDetections({ detections, loading, error, onVerify, onDelete, onReclassify, onProtectAudio, verifyLoading, deleteLoading, reclassifyLoading, verifyError, deleteError, reclassifyError, protecting, protectError, selectedDetection, setSelectedDetection, showModal, setShowModal }) {

    const handleShowModal = (detection) => {
        setSelectedDetection(detection);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDetection(null);
    };

    function getVerificationBadge(statusId) {
        if (statusId === VERIFICATION_STATUS_TYPE.Verified) {
            return <Badge bg="success">Verified</Badge>;
        }
        if (statusId === VERIFICATION_STATUS_TYPE.Reclassified) {
            return <Badge bg="primary">Reclassified</Badge>;
        }
        return <Badge bg="warning" text="dark">Unverified</Badge>;
    }

    function getAudioProtectionBadge(protectedStatus) {
        if (protectedStatus === AUDIO_PROTECTION_STATUS_TYPE.Protected) {
            return <Badge bg="success">Protected</Badge>;
        }
        return <Badge bg="danger">Unprotected</Badge>;
    }

    return (
        <>
            {/* Error and loading state handling */}
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <RenderSkeleton height={900}/> : (
                
                detections && detections.length > 0 ? (
                    <div>

                        {/* Render detections table */}
                        <Table striped bordered hover responsive className="shadow-sm">
                            <thead>
                                <tr className="">
                                    <th>Common Name <em>(Scientific Name)</em></th>
                                    <th>Confidence</th>
                                    <th>Verification Status</th>
                                    <th>Audio Protected</th>
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
                                            </td>
                                            <td>{Math.ceil(detection.confidence * 100)}%</td>
                                            <td>{getVerificationBadge(detection.verification_status_id)}</td>
                                            <td>{getAudioProtectionBadge(detection.protected)}</td>
                                            <td>{formatStringToDate(detection.detection_timestamp)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                        </Table>

                        <DetectionModal
                            show={showModal}
                            onHide={handleCloseModal}
                            detection={selectedDetection}
                            onVerify={() => onVerify(selectedDetection?.detection_id)}
                            onDelete={() => onDelete(selectedDetection?.detection_id)}
                            onReclassify={(stationId, detectionId, alternativePredictionId) =>
                                onReclassify(stationId, detectionId, alternativePredictionId)
                            }
                            onProtectAudio={(audioId, protect) => onProtectAudio(audioId, protect)}
                            protecting={protecting}
                            protectError={protectError}
                            verifyLoading={verifyLoading}
                            deleteLoading={deleteLoading}
                            reclassifyLoading={reclassifyLoading}
                            verifyError={verifyError}
                            deleteError={deleteError}
                            reclassifyError={reclassifyError}
                        />
                    </div>
                ) : (
                    <div className="alert alert-info">
                        No detections found matching your search criteria.
                    </div>
                )
            )}
        </>
    );
}