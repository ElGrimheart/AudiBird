import React from "react";
import DashboardCard from "./DashboardCard";
import { Spinner } from "react-bootstrap";

// SummaryCard component to display overall detection statistics for a station
const SummaryCard = ({ summaryData, loading, error }) => {
    return (
        <DashboardCard title="Overall Detection Summary">
            {loading && <Spinner animation="border" />}
            {error && <div className="text-danger">Error: {error.message}</div>}
            {!loading && !error && (
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
            )}
        </DashboardCard>
    )
}

export default SummaryCard;