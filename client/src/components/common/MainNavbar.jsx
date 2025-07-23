import { NavLink, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import axios from 'axios';

// MainNavbar component for top navigation bar on all pages
const MainNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_USER_URL}/logout`);
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem('jwt');
    navigate('/');
  };

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
              <NavDropdown.Item onClick={handleLogout}>
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