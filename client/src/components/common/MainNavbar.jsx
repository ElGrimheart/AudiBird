import React, { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import UserStationsContext from '../../contexts/UserStationsContext';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import useLogout from '../../hooks/useLogout';

/*
MainNavbar component that provides navigation links and station selection
It uses context to manage the selected station throughout the application.
*/
export default function MainNavbar() {
    const { selectedStation, setSelectedStation } = useContext(SelectedStationContext);
    const { stations } = useContext(UserStationsContext);

    const handleLogout = useLogout();

    const handleStationChange = (event) => {
        const stationId = event.target.value;
        setSelectedStation(stationId);
    };

    // Set the default station when the component mounts or when stations change
    useEffect(() => {
        if (stations && stations.length > 0) {
            const defaultStation = stations.find(station => station.station_user_type_id === 1);
            if (defaultStation) {
                setSelectedStation(defaultStation.station_id);
            } else {
                setSelectedStation("");
            }
        }
    }, [stations, setSelectedStation]);

    return (
        <Navbar expand="sm" className="bg-body-tertiary">
            <Container fluid>
                <Navbar.Brand as={NavLink} to="/">AudiBird</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={NavLink} to="/dashboard" end>Dashboard</Nav.Link>
                    <Nav.Link as={NavLink} to="/detections">Detections</Nav.Link>
                    <Nav.Link as={NavLink} to="/analytics">Analytics</Nav.Link>
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
                            <NavDropdown title={stations.find((station) => station.station_id === selectedStation)?.station_name || "Select Station"} id="station-dropdown">
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