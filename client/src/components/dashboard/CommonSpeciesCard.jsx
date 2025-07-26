import React from "react";
import DashboardCard from "./DashboardCard";
import { Spinner } from "react-bootstrap";

// CommonSpeciesCard component to display the most common species detected by a station
const CommonSpeciesCard = ({ speciesData, loading, error }) => {
    return (
        <DashboardCard title="Most Common Species">
            {loading && <Spinner animation="border" />}
            {error && <div className="text-danger">Error: {error.message}</div>}
            {!loading && !error && (
                <ol className="list mb-0">
                    {speciesData.map((species, index) => (
                        <li key={index}>
                            <strong>{species.common_name}</strong> — {species.count} detections
                        </li>
                    ))}
                </ol>
            )}
        </DashboardCard>
    );
};

export default CommonSpeciesCard;