import React from "react";
import DashboardCard from "./DashboardCard";

// TopSpeciesCard component to display the most common species detected in a card format
const TopSpeciesCard = ({ speciesArray }) => {
    return (
        <DashboardCard title="Most Common Species">
            <ol className="list mb-0">
                {speciesArray.map((species, index) => (
                <li key={index}>
                    <strong>{species.common_name}</strong> — {species.count} detections
                </li>
                ))}
            </ol>
    </DashboardCard>
    );
};

export default TopSpeciesCard;