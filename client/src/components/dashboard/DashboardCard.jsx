import React from "react";
import Card from "react-bootstrap/Card";

// DashboardCard component to encapsulate the common structure of cards used in the dashboard
const DashboardCard = ({ title, children, footer }) => {
    return (
        <Card className="shadow-sm h-100">
            {title && <Card.Header className="fw-bold bg-light">{title}</Card.Header>}
            <Card.Body>{children}</Card.Body>
            {footer && <Card.Footer className="text-muted">{footer}</Card.Footer>}
        </Card>
    )
}

export default DashboardCard;