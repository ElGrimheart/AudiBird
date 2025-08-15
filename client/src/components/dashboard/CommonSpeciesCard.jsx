import React from "react";
import AvatarImage from "../common/Avatar";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";
import * as externalLink from '../../constants/external-links';

/* 
CommonSpeciesCard component to display the most common species detected by a station.
Includes avatar images and external links to eBird for more information.
*/
export default function CommonSpeciesCard({ speciesData, loading, error }){

    return (
        <ComponentCard title="Most Common Species">
            {/* Error handling and loading state */}
            {error && <div className="text-danger">Error: {error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (

                /* Display species data */
                <ol className="list mb-0">
                    {speciesData && speciesData.length > 0 ? 
                        speciesData.map((species, index) => (
                            <li key={index} className="mb-2">
                                <AvatarImage 
                                    src={species.image_url} 
                                    alt={`${species.common_name} by ${species.image_rights}; ${externalLink.EXTERNAL_MEDIA_NAME}`}
                                    commonName={species.common_name}
                                    contributor={species.image_rights}
                                    size={72} 
                                    className="me-2 birdAvatar"
                                />
                                <strong> {species.common_name}</strong> 
                                <em> ({species.scientific_name}) 
                                    <a href={`${externalLink.EXTERNAL_SPECIES_URL}/${species.species_code}`} target="_blank" rel="noopener noreferrer">
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
}