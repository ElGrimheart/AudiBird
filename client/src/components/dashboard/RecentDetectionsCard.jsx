import React from "react";
import DashboardCard from "./DashboardCard";
import { formatStringToDate } from "../../utils/dateFormatter";


const RecentDetectionsCard = ({ detectionList }) => {
    
    return (   
        <DashboardCard title="Most Recent Detections">
            <ul className="list-unstyled mb-0">
                {detectionList.map((detection, index) => (
                    <li key={index} className="mb-2">
                        {index+1}. <strong>{detection.common_name}</strong> - {formatStringToDate(detection.detection_timestamp)} - {Math.round(detection.confidence*100)}%
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
}

export default RecentDetectionsCard;