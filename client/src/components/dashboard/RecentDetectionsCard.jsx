import React from "react";
import DashboardCard from "./DashboardCard";


const RecentDetectionsCard = ({ detectionList }) => {
    
    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };
    
    return (   
        <DashboardCard title="Most Recent Detections">
            <ul className="list-unstyled mb-0">
                {detectionList.map((detection, index) => (
                    <li key={index} className="mb-2">
                        {index+1}. <strong>{detection.common_name}</strong> - {formatDate(detection.detection_time)} - {Math.round(detection.confidence*100)}%
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
}

export default RecentDetectionsCard;