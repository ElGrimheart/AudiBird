import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DashboardCard from "./DashboardCard";
import AvatarImage from "../common/Avatar";
import { Spinner } from "react-bootstrap";

// CommonSpeciesCard component to display the most common species detected by a station
const CommonSpeciesCard = ({ speciesData, loading, error }) => {
    
    const renderSkeleton = () => {
        return (
            <div>
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                <ol className="list mb-0">
                    {Array(5).fill(0).map((_, index) => (
                        <li key={index} className="mb-2">
                            <strong><Skeleton width={120} /></strong> 
                            <Skeleton width={100} />
                        </li>
                    ))}
                </ol>
            </div>
        );
    };

    return (
        <DashboardCard title="Most Common Species">
            {error && <div className="text-danger">Error: {error.message}</div>}
            {loading ? renderSkeleton() : (
                <ol className="list mb-0">
                    {speciesData && speciesData.length > 0 ? 
                        speciesData.map((species, index) => (
                            <li key={index} className="mb-2">
                                <AvatarImage 
                                    src={species.image_url || "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/305880301/320"} 
                                    alt={` ${species.common_name}, ${species.scientific_name} - Copyright: ${species.rights_holder}`}
                                    size={56} 
                                    className="me-2 birdAvatar"
                                />
                                <strong> {species.common_name}</strong> — {species.count} detections
                            </li>
                        )) : 
                        <li>No species data available</li>
                    }
                </ol>
            )}
        </DashboardCard>
    );
};

export default CommonSpeciesCard;