import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import UserStationsContext from '../../contexts/UserStationsContext';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useLogout from '../../hooks/useLogout';

// MainNavbar component for top navigation bar on all pages
const MainNavbar = () => {
    const { setSelectedStation } = useContext(SelectedStationContext);
    const { stations } = useContext(UserStationsContext);
    const [selectedStation, setLocalSelectedStation] = useState("");

    React.useEffect(() => {
        if (stations && stations.length > 0) {
            const defaultStation = stations.find(station => station.station_user_type_id === 1);
            if (defaultStation) {
                setLocalSelectedStation(defaultStation.station_id);
                setSelectedStation(defaultStation.station_id);
            } else {
                setLocalSelectedStation("");
                setSelectedStation("");
            }
        }
    }, [stations, setSelectedStation]);
    const handleLogout = useLogout();

    // Update selected station name based on navbar
    const selectedStationName = stations.find((station) => station.station_id === selectedStation)?.station_name || "Select Station";

    const handleStationChange = (event) => {
        const stationId = event.target.value;
        setLocalSelectedStation(stationId);
        setSelectedStation(stationId);
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
              {stations && stations.length > 0 && (
                <NavDropdown title={selectedStationName} id="station-dropdown">
                  {stations.map((station) => (
                    <NavDropdown.Item key={station.station_id} value={station.station_id} onClick={() => handleStationChange({ target: { value: station.station_id } })}>
                      {station.station_name}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
}

export default MainNavbar;