import React from "react";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";

// StationCard component to display the status of a specific station
export default function StationCard({ station, loading, error }) {

    return (
        <ComponentCard title="Station Status">
            {error && <div className="text-danger">Error: {error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (
                station ? (
                <div className="text-center">
                    <h2 className="display-5 mb-0">{station.name}</h2>
                    <p className="text-muted">{station.description}</p>
                    <p className={`text-${station.isActive ? 'success' : 'danger'}`}>
                        {station.isActive ? 'Active' : 'Inactive'}
                    </p>
                </div>
                ) : (
                    <div className="text-center text-muted">
                        No station data available
                    </div>
                )
            )}
        </ComponentCard>
    );
}