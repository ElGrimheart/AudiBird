import React, { useState } from "react";
import { Modal, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { BoxArrowUpRight, Check2 } from "react-bootstrap-icons";
import AvatarImage from "./Avatar.jsx";
import * as externalLink from '../../constants/external-links.js';
import { formatStringToDate } from "../../utils/date-formatter";
import useAlternativeSpecies from "../../hooks/useAlternativeSpecies.jsx";
import { VERIFICATION_STATUS_TYPE, AUDIO_PROTECTION_STATUS_TYPE } from "../../constants/type-ids";

/*
DetectionModal component to display detailed information about a specific detection.
Provides functionality for verifying, reclassifying, deleting detections, and protecting audio.
*/
export default function DetectionModal({
    show,
    onHide,
    detection,
    onVerify,
    onReclassify,
    onDelete,
    onProtectAudio,
    deleting,
    deleteError,
    verifying,
    verifyError,
    protecting,
    protectError
}) {
    const [showAlternatives, setShowAlternatives] = useState(false);

    const stationId = detection?.station_id;
    const detectionId = detection?.detection_id;
    const { alternativeSpecies, loading: altLoading, error: altError } = useAlternativeSpecies(stationId, detectionId);

    function renderError(error) {
        if (!error) return null;
        if (typeof error === "string") return error;
        if (error.message) return error.message;
        try {
            return JSON.stringify(error.message);
        } catch {
            return "An error occurred";
        }
    }

    return (
        <Modal show={show} onHide={() => { setShowAlternatives(false); onHide(); }} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Detection Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {detection && (
                    <>
                        {/* Main Detection Info */}
                        <Row>
                            <Col md={6}>
                                <a href={detection.image_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={detection.image_url || "/bird_avatar_placeholder.png"}
                                        title={`${detection.common_name} by ${detection.image_rights}; ${externalLink.EXTERNAL_MEDIA_NAME}`}
                                        className="img-fluid mb-3"
                                        alt={detection.common_name}
                                    />
                                </a>
                            </Col>
                            <Col md={6} className="d-flex flex-column justify-content-center">
                                <div>
                                    <p>
                                        <strong>Common Name:</strong> {detection.common_name}{" "}
                                        <a href={`${externalLink.EXTERNAL_SPECIES_URL}/${detection.species_code}`} target="_blank" rel="noopener noreferrer">
                                            <BoxArrowUpRight size={12} aria-label="external link" title="External link" style={{ marginLeft: 4 }} />
                                        </a>
                                    </p>
                                    <p><strong>Scientific Name:</strong> <em>{detection.scientific_name}</em></p>
                                    <p><strong>Confidence:</strong> {Math.round(detection.confidence * 100)}%</p>
                                    <p><strong>Date:</strong> {formatStringToDate(detection.detection_timestamp)}</p>
                                    <audio controls src={`${import.meta.env.VITE_API_AUDIO_URL}/${detection.audio_id}`} />
                                    <div className="mt-2 d-flex align-items-center">
                                        <input
                                            aria-label="Protect audio"
                                            type="checkbox"
                                            checked={detection.protected === AUDIO_PROTECTION_STATUS_TYPE.Protected}
                                            onChange={(e) => onProtectAudio(detection.audio_id, e.target.checked)}
                                            disabled={protecting}
                                            id="protect-audio-checkbox"
                                            className="me-2"
                                        />
                                        <label htmlFor="protect-audio-checkbox" className="mb-0">Protect Audio</label>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <hr />


                        {/* Conditional render of actions buttons or alternative species suggestions */}
                        {!showAlternatives ? (
                            <>
                                {/* External audio sample */}
                                <Row className="mb-3">
                                    <Col>
                                        <div className="d-flex align-items-center">
                                            <strong className="me-2 flex-shrink-0">
                                                Sample Audio ({detection.common_name}):
                                            </strong>
                                            <audio
                                                controls
                                                src={detection.audio_url}
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                    </Col>
                                </Row>

                                {/* Verify, reclassify, delete buttons */}
                                <div className="d-flex justify-content-center align-items-start gap-3 mb-4 flex-wrap">
                                    <div className="text-center mb-3 mb-md-0">
                                        <div className="mb-2"><strong>Sounds right?</strong></div>
                                        <Button
                                            variant="success"
                                            onClick={onVerify}
                                            disabled={deleting || verifying || detection.verification_status_id === VERIFICATION_STATUS_TYPE.Verified}
                                        >
                                            {detection.verification_status_id === VERIFICATION_STATUS_TYPE.Verified ? (
                                                <><Check2 size={20} className="me-2" />Verified</>
                                            ) : verifying ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                "Verify Detection"
                                            )}
                                        </Button>
                                    </div>
                                    <div className="vr mx-4 d-none d-md-block" />
                                    <div className="text-center mb-3 mb-md-0">
                                        <div className="mb-2"><strong>Close! But not quite right?</strong></div>
                                        <Button
                                            variant="warning"
                                            onClick={() => setShowAlternatives(true)}
                                            disabled={deleting || verifying || (alternativeSpecies?.length === 0)}
                                        >
                                            View Alternative Predictions
                                        </Button>
                                    </div>
                                    <div className="vr mx-4 d-none d-md-block" />
                                    <div className="text-center mb-3 mb-md-0">
                                        <div className="mb-2"><strong>False alarm?</strong></div>
                                        <Button
                                            variant="danger"
                                            onClick={onDelete}
                                            disabled={deleting || verifying || detection.protected }
                                        >
                                            {deleting ? <Spinner animation="border" size="sm" /> : "Delete Detection"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Error Messages */}
                                {(deleteError || verifyError || protectError) && (
                                    <Alert variant="danger" className="mb-3">
                                        {renderError(deleteError) || renderError(verifyError) || renderError(protectError)}
                                    </Alert>
                                )}

                                {/* Detection metadata */}
                                <hr />
                                <Row>
                                    <Col md={4}>
                                        <h6>Detection Station</h6>
                                        <p><strong>Name:</strong> {detection.station_metadata?.station_name}</p>
                                        <p><strong>Location:</strong> {detection.station_metadata?.description}</p>
                                        <p><strong>Latitude:</strong> {detection.station_metadata?.lat}</p>
                                        <p><strong>Longitude:</strong> {detection.station_metadata?.lon}</p>
                                    </Col>
                                    <Col md={4}>
                                        <h6>Audio Data</h6>
                                        <p><strong>Duration:</strong> {detection.audio_metadata?.duration} seconds</p>
                                        <p><strong>Format:</strong> {detection.audio_metadata?.format}</p>
                                        <p><strong>Channels:</strong> {detection.audio_metadata?.channels}</p>
                                        <p><strong>Sample Rate:</strong> {detection.audio_metadata?.sample_rate} Hz</p>
                                        <p><strong>Data type:</strong> {detection.audio_metadata?.dtype}</p>
                                    </Col>
                                    <Col md={4}>
                                        <h6>Analyser Information</h6>
                                        <p><strong>Model:</strong> {detection.processing_metadata?.model_name}</p>
                                        <p><strong>Sensitivity:</strong> {detection.processing_metadata?.sensitivity}</p>
                                        <p><strong>Min confidence threshold:</strong> {detection.processing_metadata?.min_confidence ? Math.round(detection.processing_metadata.min_confidence * 100) : ''}%</p>
                                        <p><strong>Segment duration:</strong> {detection.processing_metadata?.segment_duration} s</p>
                                        <p><strong>Segment overlap:</strong> {detection.processing_metadata?.segment_overlap} s</p>
                                    </Col>
                                </Row>
                            </>
                        ) : (
                            <>
                                {/* Alternatives predictions list */}
                                <h5>Alternative Predictions:</h5>
                                {altLoading && <div>Loading alternatives...</div>}
                                {altError && <div className="text-danger">Error loading alternatives.</div>}
                                {(!altLoading && (!alternativeSpecies || alternativeSpecies.length === 0)) && <div className="text-center">No alternative predictions available.</div>}

                                <div className="d-flex flex-column align-items-center justify-content-center w-100">
                                    {Array.isArray(alternativeSpecies) && alternativeSpecies.map((alt, idx) => (
                                        <div
                                            key={idx}
                                            className="border rounded p-3 d-flex justify-content-center flex-wrap w-100"
                                        >
                                            {/* Alternative species image */}
                                            <AvatarImage 
                                                src={alt.image_url} 
                                                alt={`${alt.common_name} by ${alt.image_rights}; ${externalLink.EXTERNAL_MEDIA_NAME}`}
                                                commonName={alt.common_name}
                                                contributor={alt.image_rights}
                                                size={80} 
                                                className="me-2 birdAvatar"
                                            />

                                            {/* Alternative species info and audio sample */}
                                            <div className="d-flex align-items-center flex-grow-1 gap-3 flex-wrap justify-content-center">
                                                {alt.audio_url && (
                                                    <audio controls src={alt.audio_url} style={{maxWidth: 150 }} />
                                                )}
                                                <div>
                                                    <strong>{alt.common_name}</strong>
                                                    <span className="ms-2">Confidence: {Math.round(alt.confidence * 100)}%</span>
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => {
                                                        setShowAlternatives(false);
                                                        onReclassify(stationId, detectionId, alt.alternative_prediction_id);
                                                    }}
                                                    disabled={deleting || verifying}
                                                    className="ms-2"
                                                >
                                                    Reclassify
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Back button */}
                                <div className="modal-footer mt-4 d-flex justify-content-center">
                                    <Button variant="secondary" onClick={() => setShowAlternatives(false)}>
                                        Back
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}