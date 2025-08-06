import React from 'react';
import { Offcanvas } from 'react-bootstrap';

// Reusable collapsible sidebar component.
export default function Sidebar({ title, show, onHide, children }) {
    return (
        <Offcanvas show={show} onHide={onHide} placement="end" scroll={true} backdrop={true}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{title}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {children}
            </Offcanvas.Body>
        </Offcanvas>
    );
}