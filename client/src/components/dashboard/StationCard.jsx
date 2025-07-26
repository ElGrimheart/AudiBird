import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DashboardCard from "./DashboardCard";
import { Spinner } from "react-bootstrap";

// StationCard component to display the status of a specific station
const StationCard = ({ station, loading, error }) => {
    
    const renderSkeleton = () => {
        return (
            <div>
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                <div className="text-center">
                    <h2 className="display-5 mb-0"><Skeleton width={180} /></h2>
                    <p className="text-muted"><Skeleton width={250} /></p>
                    <p><Skeleton width={100} /></p>
                </div>
            </div>
        );
    };

    return (
        <DashboardCard title="Station Status">
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
                        No station information available
                    </div>
                )
            )}
        </DashboardCard>
    );
};

export default StationCard;