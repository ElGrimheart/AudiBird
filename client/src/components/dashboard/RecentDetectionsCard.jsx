import React from "react";
import DashboardCard from "./DashboardCard";
import { formatStringToDate } from "../../utils/dateFormatter";
import { Spinner } from "react-bootstrap";

// RecentDetectionsCard component to display a list of recent detections in a card format
const RecentDetectionsCard = ({ detectionsData, loading, error }) => {

    return (
        <DashboardCard title="Recent Detections">
            {loading && <Spinner animation="border" />}
            {error && <div className="text-danger">{error.message}</div>}
            {!loading && !error && (
                <ol className="list mb-0">
                    {detectionsData.map((detection, index) => (
                        <li key={index} className="mb-2">
                            <strong>{detection.common_name}</strong> - {formatStringToDate(detection.detection_timestamp)} - {Math.round(detection.confidence * 100)}%
                        </li>
                    ))}
                </ol>
            )}
        </DashboardCard>
    );
}

export default RecentDetectionsCard;