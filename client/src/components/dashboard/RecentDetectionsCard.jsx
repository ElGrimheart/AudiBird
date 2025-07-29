import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DashboardCard from "./DashboardCard";
import DetectionModal from '../common/DetectionModal.jsx';
import AudioPlayer from "../common/AudioPlayer";
import { Container, Spinner } from "react-bootstrap";
import { formatStringToDate } from "../../utils/dateFormatter";

// RecentDetectionsCard component to display a list of recent detections by a station
const RecentDetectionsCard = ({ detectionsData, loading, error }) => {
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

    const renderSkeleton = () => {
        return (
            <div>
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                <ol className="list mb-0">
                    {Array(3).fill(0).map((_, index) => (
                        <li key={index} className="mb-2">
                            <strong><Skeleton width={120} /></strong> 
                            <Skeleton width={180} />
                        </li>
                    ))}
                </ol>
            </div>
        );
    };

    return ( 
            <DashboardCard title="Recent Detections">
                {error && <div className="text-danger">{error.message}</div>}
                {loading ? renderSkeleton() : (
                    <ol className="list mb-0">
                        {detectionsData && detectionsData.length > 0 ? 
                            detectionsData.map((detection, index) => (
                                <li key={index}
                                    className="mb-2"
                                    onClick={() => handleShowModal(detection)}
                                    style={{ cursor: "pointer" }}
                                    tabIndex={0}
                                >
                                    {detection.audio_id ? (
                                        <AudioPlayer
                                            src={`${import.meta.env.VITE_API_AUDIO_URL}/${detection.audio_id}`}
                                            audioId={detection.audio_id} 
                                        />
                                    ) : (null)}
                                    <strong>{" "}{detection.common_name}</strong> 
                                    {" "}- {formatStringToDate(detection.detection_timestamp)} 
                                    {" "}- {Math.round(detection.confidence * 100)}%
                                    {" "}
                                </li>
                            )) : 
                            <li>No recent detections</li>
                        }
                    </ol>
                )}

                <DetectionModal
                    show={showModal}
                    onHide={handleCloseModal}
                    detection={selectedDetection}
                />
            </DashboardCard>
    );
}

export default RecentDetectionsCard;