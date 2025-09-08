import React, { useContext, useState } from "react";
import ComponentCard from "../common/ComponentCard.jsx";
import SkeletonComponent from "../common/SkeletonPlaceholder.jsx";
import DetectionModal from '../common/DetectionModal.jsx';
import useVerifyDetection from "../../hooks/useVerifyDetection.jsx";
import useReclassifyDetection from "../../hooks/useReclassifyDetection.jsx";
import useDeleteDetection from "../../hooks/useDeleteDetection.jsx";
import useProtectAudio from "../../hooks/useProtectAudio.jsx";
import { formatStringToDate } from "../../utils/date-formatter";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import { VERIFICATION_STATUS_TYPE, AUDIO_PROTECTION_STATUS_TYPE } from "../../constants/type-ids.js";

/* 
RecentDetectionsCard component to display a list of recent detections by a station.
Includes a modal for detailed detection information including audio playback and alternative species suggestions.
Modal provides functionality for verifying, reclassifying and deleting detections - data is refreshed accordingly.
*/
export default function RecentDetectionsCard({ detectionsData, loading, refreshDetections, refreshCommonSpecies, refreshSummaryStats }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { verifyDetection, loading: verifying, error: verifyError, setError: setVerifyError } = useVerifyDetection();
    const { reclassifyDetection, loading: reclassifying, error: reclassifyError, setError: setReclassifyError } = useReclassifyDetection();
    const { deleteDetection, loading: deleting, error: deleteError, setError: setDeleteError } = useDeleteDetection();
    const { protectAudio, loading: protecting, error: protectError, setError: setProtectError } = useProtectAudio();
    
    const [showModal, setShowModal] = useState(false);
    const [selectedDetection, setSelectedDetection] = useState(null);

    // Handle detection verification button click
    const handleVerify = async () => {
        if (selectedDetection) {
            const result = await verifyDetection(selectedStation, selectedDetection.detection_id);
            if (result && !verifyError) {
                setSelectedDetection({
                    ...selectedDetection,
                    verification_status_id: VERIFICATION_STATUS_TYPE.Verified
                });
                await refreshDetections();
            }
        }
    };

    // Handle detection reclassification button click
    const handleReclassify = async (stationId, detectionId, altSpeciesId) => {
        await reclassifyDetection(stationId, detectionId, altSpeciesId);
        await refreshDetections();
        await refreshCommonSpecies();
        await refreshSummaryStats();
        handleCloseModal();
    };

    // Handle detection deletion button click
    const handleDelete = async () => {
        if (selectedDetection) {
            const result = await deleteDetection(selectedStation, selectedDetection.detection_id);
            if (result && !deleteError) {
                handleCloseModal();
                if (refreshDetections) {
                   await refreshDetections();
                    await refreshCommonSpecies();
                    await refreshSummaryStats();
                }
            }
        }
    };

    // Handle audio protection check/uncheck
    const handleProtectAudio = async (audioId, protect) => {
        if (selectedDetection) {
            setSelectedDetection({
                ...selectedDetection,
                protected: (protect ? AUDIO_PROTECTION_STATUS_TYPE.Protected : AUDIO_PROTECTION_STATUS_TYPE.Unprotected)
            });
            await protectAudio(selectedStation, audioId, protect);
            await refreshDetections();
        }
    };

    // Handle close modal (reset all states/error messages)
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDetection(null);
        setVerifyError(null);
        setReclassifyError(null);
        setDeleteError(null);
        setProtectError(null);
    };

    const handleShowModal = (detection) => {
        setSelectedDetection(detection);
        setShowModal(true);
    };


    return (
        <ComponentCard title="Recent Detections">
            {/* Error handling and loading state */}
            {loading ? <SkeletonComponent height={300} /> : (

                /* Display recent detections */
                
                <ol className="list mb-0">
                        {detectionsData && detectionsData.length > 0 ? 
                            detectionsData.map((detection, index) => (
                                <li key={index}
                                    className="mb-2 detection-list-item"
                                    onClick={() => handleShowModal(detection)}
                                    style={{ cursor: "pointer" }}
                                    tabIndex={0}
                                >
                                    <strong>{" "}{detection.common_name}</strong> 
                                    {" "}- {formatStringToDate(detection.detection_timestamp)} 
                                    {" "}- {Math.round(detection.confidence * 100)}%
                                    {" confident"}
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
                    onVerify={handleVerify}
                    onReclassify={handleReclassify}
                    onDelete={handleDelete}
                    onProtectAudio={handleProtectAudio}
                    verifying={verifying}
                    verifyError={verifyError}
                    reclassifying={reclassifying}
                    reclassifyError={reclassifyError}
                    deleting={deleting}
                    deleteError={deleteError}
                    protecting={protecting}
                    protectError={protectError}
                />
            </ComponentCard>
    );
}