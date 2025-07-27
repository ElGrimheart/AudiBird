import React from 'react';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Spinner } from "react-bootstrap";
import Accordion from 'react-bootstrap/Accordion';
import { formatStringToDate } from '../../utils/dateFormatter';

// FilteredDetections component to display detections in an accordion format
const FilteredDetections = ({ detections, loading, error }) => {
    
    const renderSkeleton = () => {
        return (
            <div>
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="mb-3 border rounded p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <Skeleton width={250} />
                            </div>
                            <div>
                                <Skeleton width={150} height={35} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (error) {
        return <div className="alert alert-danger">{error.message || "Error loading detections"}</div>;
    }
    
    if (loading) {
        return renderSkeleton();
    }
    
    if (!detections || detections.length === 0) {
        return <div className="alert alert-info">No detections found matching your criteria.</div>;
    }
    
    return (
        <Accordion>
            {detections.map(detection => (
                <Accordion.Item eventKey={detection.detection_id} key={detection.detection_id}>
                    <Accordion.Header>
                        {detection.common_name}, {detection.scientific_name}, {formatStringToDate(detection.detection_timestamp)}, {Math.round(detection.confidence * 100)}%
                        {detection.audio_id ? (
                            <audio controls src={`${import.meta.env.VITE_API_AUDIO_URL}/${detection.audio_id}`} />
                        ) : (
                            " No audio available"
                        )}
                    </Accordion.Header>
                    <Accordion.Body>
                        <div>
                            <p>Confidence: {Math.round(detection.confidence * 100)}%</p>
                            {detection.audio_metadata && Object.entries(detection.audio_metadata).map(([key, value]) => (
                                <p key={key}>{key}: {value}</p>
                            ))}
                            {detection.processing_metadata && Object.entries(detection.processing_metadata).map(([key, value]) => (
                                <p key={key}>{key}: {value}</p>
                            ))}
                            {detection.station_metadata && Object.entries(detection.station_metadata).map(([key, value]) => (
                                <p key={key}>{key}: {value}</p>
                            ))}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            ))}
        </Accordion>
    );
};

export default FilteredDetections;