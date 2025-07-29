import React from "react";
import { Modal, Button } from "react-bootstrap";
import { formatStringToDate } from "../../utils/dateFormatter";

// DetectionDetailsModal component to display detailed information about a detection
const DetectionModal = ({ show, onHide, detection }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>Detection Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {detection && (
                <div>
                    <img
                        src={detection.image_url || "../../../public/bird_avatar_placeholder.png"}
                        title={`${detection.common_name} by ${detection.image_rights}; ${import.meta.env.VITE_EXTERNAL_MEDIA_NAME}`}
                        className="img-fluid mb-3"
                        alt={detection.common_name}
                    />
                    {detection.audio_id ? (
                        <audio controls src={`${import.meta.env.VITE_API_AUDIO_URL}/${detection.audio_id}`} />
                    ) : (
                        <span className="text-muted">No audio</span>
                    )}
                    <p><strong>Common Name:</strong> {detection.common_name}</p>
                    <p><em><strong>Scientific Name:</strong> {detection.scientific_name} </em></p>
                    <p><strong>Confidence:</strong> {Math.round(detection.confidence * 100)}%</p>
                    <p><strong>Date:</strong> {formatStringToDate(detection.detection_timestamp)}</p>
                    <p><strong>Location:</strong> {detection.location}</p>
                    <hr />
                    <h6>Recording Station:</h6>
                    <p>Station Name: {detection.station_metadata.station_name}</p>
                    <p>Description: {detection.station_metadata.description}</p>
                    <p>Latitude: {detection.station_metadata.lat}, Longitude: {detection.station_metadata.lon}</p>
                    <hr />
                    <h6>Recording Data</h6>
                    <p>Duration: {detection.audio_metadata.duration} seconds</p>
                    <p>Format: {detection.audio_metadata.format} wav </p>
                    <p>Channels: {detection.audio_metadata.channels}</p>
                    <p>Sample Rate: {detection.audio_metadata.sample_rate} Hz</p>
                    <p>Sample Width: {detection.audio_metadata.sample_width} bits</p>
                    <p>Data type: {detection.audio_metadata.dtype}</p>
                    <hr />
                    <h6>Processing Information</h6>
                    <p>Model: {detection.processing_metadata.model_name}</p>
                    <p>Min confidence threshold: {detection.processing_metadata.min_confidence*100}%</p>
                    <p>Segment duration: {detection.processing_metadata.segment_duration} seconds</p>
                    <p>Segment overlap: {detection.processing_metadata.segment_overlap} seconds</p>
                    <p>Processing time: {detection.processing_metadata.processing_time} seconds</p>
                </div>
            )}
        </Modal.Body>
    </Modal>
);

export default DetectionModal;