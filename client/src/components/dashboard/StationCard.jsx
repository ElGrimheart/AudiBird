import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Spinner } from "react-bootstrap";

// StationCard component to display the status of a specific station
export default function StationCard({ station, loading, error }) {

    function renderSkeleton() {
        return (
            <div>
                <div style={{ height: "200px", position: "relative" }}>
                    <Skeleton height="100%" />
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </div>
        );
    }

    return (
        <ComponentCard title="Station Status">
            {error && <div className="text-danger">Error: {error.message}</div>}
            {loading ? renderSkeleton() : (
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