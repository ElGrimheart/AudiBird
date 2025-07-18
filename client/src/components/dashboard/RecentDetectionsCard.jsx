import React from "react";
import DashboardCard from "./DashboardCard";
import { formatStringToDate } from "../../utils/dateFormatter";

// RecentDetectionsCard component to display a list of recent detections in a card format
const RecentDetectionsCard = ({ detectionsArray }) => {

    return (
        <DashboardCard title="Most Recent Detections">
            <ol className="list mb-0">
                {detectionsArray.map((detection, index) => (
                    <li key={index} className="mb-2">
                         <strong>{detection.common_name}</strong> - {formatStringToDate(detection.detection_timestamp)} - {Math.round(detection.confidence*100)}%
                    </li>
                ))}
            </ol>
        </DashboardCard>
    );
}

export default RecentDetectionsCard;