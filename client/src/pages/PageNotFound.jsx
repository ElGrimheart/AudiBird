import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// PageNotFound component to display a 404 error page
export default function PageNotFound() {
    return (
        <Container fluid className="p-4 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md={6} className="text-center">
                    <h1 className="display-3 mb-3">404</h1>
                    <h2 className="mb-3">Page Not Found</h2>
                    <p className="mb-4">The page you are looking for does not exist or has been moved.</p>
                    <Button as={Link} to="/dashboard" variant="primary">
                        Go to Dashboard
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}