import React, { useState } from "react";
import ComponentCard from "../common/ComponentCard.jsx";
import SkeletonComponent from "../common/SkeletonPlaceholder.jsx";
import DetectionModal from '../common/DetectionModal.jsx';
import AudioPlayer from "../common/AudioPlayer";
import { formatStringToDate } from "../../utils/dateFormatter";

// RecentDetectionsCard component to display a list of recent detections by a station
export default function RecentDetectionsCard({ detectionsData, loading, error }) {
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

    return (
        <ComponentCard title="Recent Detections">
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (
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
            </ComponentCard>
    );
}