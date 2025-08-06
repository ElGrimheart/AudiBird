import React from "react";
import Card from "react-bootstrap/Card";

// Generic DashboardCard component to encapsulate the common styling of cards used throughout the dashboard
export default function ComponentCard({ title, children, footer }) {
    return (
        <Card className="shadow-sm h-100">
            {title && <Card.Header className="fw-bold bg-light">{title}</Card.Header>}
            <Card.Body>{children}</Card.Body>
            {footer && <Card.Footer className="text-muted">{footer}</Card.Footer>}
        </Card>
    )
}