import React from "react";
import DashboardCard from "./DashboardCard";

const SummaryCard = ({ stats }) => {
    return (
        <DashboardCard title="Overall Detection Summary">
            <table className="table table-striped">
                <tbody>
                    {stats.map((stat, index) => (
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