import React, { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import ChartFilterBar from "./ChartFilterBar.jsx";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import useSpeciesSummary from "../../hooks/useSpeciesSummary.jsx";
import SkeletonComponent from "../common/SkeletonPlaceholder.jsx";
import ComponentCard from "../common/ComponentCard.jsx";
import { formatStringToDate } from "../../utils/dateFormatter";

/*
SpeciesStats component to display detailed statistics for a specific species
It includes a filter bar for selecting species and displays a summary table with relevant
information such as detection counts, first/last detection dates
*/
export default function SpeciesStats({ filters, setFilters }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { speciesSummary, loading, error } = useSpeciesSummary(selectedStation, { filters });

    const image_url = speciesSummary.find(stat => stat.key.toLowerCase() === "image url")?.value || "bird_avatar_placeholder.png";
    const image_rights = speciesSummary.find(stat => stat.key.toLowerCase() === "image rights")?.value || "Unknown";

    return (
        <ComponentCard>
            {/* Filter bar for species selection */}
            <ChartFilterBar
                filters={filters}
                setFilters={setFilters}
                showSpeciesSelect={true}
            />

            {/* Error handling and loading state */}
            {error && <div className="text-danger">{error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (
                speciesSummary && speciesSummary.length > 0 ? (

                    /* Display species summary data */
                    <div>
                        <Row>
                            <Col md={4} className="mx-5">
                                <img 
                                    src={image_url} 
                                    alt={image_rights} 
                                    title={`${filters.species} by ${image_rights}; ${import.meta.env.VITE_EXTERNAL_MEDIA_NAME}`}
                                    className="img-fluid mt-3" 
                                />
                            </Col>
                            <Col md={6} className="mt-4 mx-5">
                                <table className="table table-striped">
                                    <tbody>
                                        {speciesSummary.map((stat, idx) => {
                                            let value = stat.value;
                                            let label = stat.key;

                                        // Formatting labels and values for better readability
                                        if (label.toLowerCase()==="first detection" || label.toLowerCase()==="last detection" || label.toLowerCase()==="peak day") {
                                            value = value ? formatStringToDate(value) : "";
                                        }

                                        if (label.toLowerCase().includes("peak day")) {
                                            value = value ? value.slice(0, 11) : "";
                                        }

                                        if (label.toLowerCase().includes("average")) {
                                            value = value ? Number(value).toFixed(2) : "";
                                        }

                                        if (label.toLowerCase().includes("image")) {
                                            return null;
                                        }
                                    

                                        return (
                                            <tr key={idx}>
                                                <td>{label}</td>
                                                <td>{value}</td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </Col>
                        </Row>
                    </div>
                ) : (
                    <div className="text-center text-muted">
                        No summary data available
                    </div>
                )
            )}
        </ComponentCard>
    );
}