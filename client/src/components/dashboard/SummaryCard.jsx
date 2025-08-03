import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ComponentCard from "../common/ComponentCard";
import { Spinner } from "react-bootstrap";

// SummaryCard component to display overall detection statistics for a station
export default function SummaryCard({ summaryData, loading, error }) {

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
        <ComponentCard title="Overall Detection Summary">
            {error && <div className="text-danger">Error: {error.message}</div>}
            {loading ? renderSkeleton() : (
                summaryData && summaryData.length > 0 ? (
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