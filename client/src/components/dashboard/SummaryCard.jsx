import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DashboardCard from "./DashboardCard";
import { Spinner } from "react-bootstrap";

// SummaryCard component to display overall detection statistics for a station
const SummaryCard = ({ summaryData, loading, error }) => {
    
    const renderSkeleton = () => {
        return (
            <div>
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                <table className="table table-striped">
                    <tbody>
                        {Array(5).fill(0).map((_, index) => (
                            <tr key={index}>
                                <td><Skeleton width={150} /></td>
                                <td><Skeleton width={100} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardCard title="Overall Detection Summary">
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
        </DashboardCard>
    );
};

export default SummaryCard;