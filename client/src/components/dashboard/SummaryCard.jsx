import React from "react";
import DashboardCard from "./DashboardCard";

// SummaryCard component to display overall detection statistics for a station in a card format
const SummaryCard = ({ statArray }) => {
    return (
        <DashboardCard title="Overall Detection Summary">
            <table className="table table-striped">
                <tbody>
                    {statArray.map((stat, index) => (
                        <tr key={index}>
                            <td>{stat.label}</td>
                            <td>{stat.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DashboardCard>
    )
}

export default SummaryCard;