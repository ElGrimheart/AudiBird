import React from "react";
import DashboardCard from "./DashboardCard";

const StationCard = ({ station }) => {
    return (
        <DashboardCard title="Station Status">
            <div className="text-center">
                <h2 className="display-5 mb-0">{station.name}</h2>
                <p className="text-muted">{station.description}</p>
                <p className={`text-${station.isActive ? 'success' : 'danger'}`}>
                    {station.isActive ? 'Active' : 'Inactive'}
                </p>
            </div>
        </DashboardCard>
    )
}

export default StationCard;