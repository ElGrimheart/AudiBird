import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import AvatarImage from "../common/Avatar";
import { BoxArrowUpRight } from "react-bootstrap-icons";
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
        <ComponentCard title="Most Common Species">
            {error && <div className="text-danger">Error: {error.message}</div>}
            {loading ? renderSkeleton() : (
                <ol className="list mb-0">
                    {speciesData && speciesData.length > 0 ? 
                        speciesData.map((species, index) => (
                            <li key={index} className="mb-2">
                                <AvatarImage 
                                    src={species.image_url || "../../../public/bird_avatar_placeholder.png"} 
                                    alt={`${species.common_name} by ${species.image_rights}; ${import.meta.env.VITE_EXTERNAL_MEDIA_NAME}`}
                                    commonName={species.common_name}
                                    contributor={species.image_rights}
                                    size={72} 
                                    className="me-2 birdAvatar"
                                />
                                <strong> {species.common_name}</strong> 
                                <em> ({species.scientific_name}) 
                                    <a href={`${import.meta.env.VITE_API_EBIRD_URL}/${species.species_code}`} target="_blank" rel="noopener noreferrer">
                                        <BoxArrowUpRight size={12} aria-label="external link" title="External link" style={{ marginLeft: 4 }} />
                                    </a>
                                </em> 
                                {" - "}{species.count} detections
                            </li>
                        )) : 
                        <li>No species data available</li>
                    }
                </ol>
            )}
        </ComponentCard>
    );
};

export default CommonSpeciesCard;