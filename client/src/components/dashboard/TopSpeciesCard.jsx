import React from "react";
import DashboardCard from "./DashboardCard";

const TopSpeciesCard = ({ speciesList }) => {
    return (
        <DashboardCard title="Most Common Species">
            <ul className="list-unstyled mb-0">
                {speciesList.map((s, i) => (
                <li key={i}>
                    <strong>{i + 1}. {s.name}</strong> — {s.count} detections
                </li>
                ))}
            </ul>
    </DashboardCard>
    );
};

export default TopSpeciesCard;