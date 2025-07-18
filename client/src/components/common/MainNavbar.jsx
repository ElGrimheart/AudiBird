import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

// MainNavbar component to render the top navigation bar on all pages
const MainNavbar = () => {
  return (
    <Navbar expand="sm" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/">AudiBird</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/dashboard" end>Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/detections">Detections</Nav.Link>
            <NavDropdown title="Settings" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Account</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">System</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Notifications</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Log out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavbar;