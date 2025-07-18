import React from 'react';
import { Offcanvas } from 'react-bootstrap';

// Collapsible sidebar component. Recieves title and children to render inside the sidebar.
const Sidebar = ({ title, show, onHide, children }) => (
    <Offcanvas show={show} onHide={onHide} placement="start" scroll={true} backdrop={true}>
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>{title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            {children}
        </Offcanvas.Body>
    </Offcanvas>
);

export default Sidebar;