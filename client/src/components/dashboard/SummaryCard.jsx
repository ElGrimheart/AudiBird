import React from "react";
import DashboardCard from "./DashboardCard";

const SummaryCard = ({ label, value}) => {
    return (
        <DashboardCard title="Detection Summary">
            <div className="text-center">
                <h2 className="display-5 mb-0">{value}</h2>
                <small className="text-muted">{label}</small>
            </div>
        </DashboardCard>
    )
}

export default SummaryCard;