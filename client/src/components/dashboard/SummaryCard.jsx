import React from "react";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";

/* SummaryCard component to display a summary of detections for a station. */
export default function SummaryCard({ summaryData, loading, error }) {

    return (
        <ComponentCard title="Station Detection Summary">
            {/* Error handling and loading state */}
            {error && <div className="text-danger">Error: {error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (
                summaryData && summaryData.length > 0 ? (

                    /* Summary table */
                    <table className="table table-striped">
                        <tbody>
                            {summaryData.map((stat, index) => (
                                <tr key={index}>
                                    <td>{stat.label}</td>
                                    <td>{stat.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center text-muted">
                        No summary data available
                    </div>
                )
            )}
        </ComponentCard>
    );
}