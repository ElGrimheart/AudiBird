import React, { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Gear } from 'react-bootstrap-icons';
import UserStationsContext from '../../contexts/UserStationsContext';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import StationMetadataContext from '../../contexts/StationMetadataContext';
import useLogout from '../../hooks/useLogout';
import { STATION_USER_TYPES } from '../../constants/user-types';

/*
MainNavbar component that provides navigation links and station selection
Uses SelectedStation context to manage the state of the selected station throughout the application.
*/
export default function MainNavbar() {
    const { selectedStation, setSelectedStation } = useContext(SelectedStationContext);
    const { usersStations } = useContext(UserStationsContext);
    const { fetchStationMetadata } = useContext(StationMetadataContext);

    const handleLogout = useLogout();

    // Updates global station selection when a new station is selected
    const handleStationChange = (event) => {
        const stationId = event.target.value;
        setSelectedStation(stationId);
    };

    // Sets the initial station when the component mounts, or when new station selected
    useEffect(() => {
        if (usersStations && usersStations.length > 0) {
            const defaultStation = usersStations.find(station => station.station_user_type_id === STATION_USER_TYPES.Owner);
            if (defaultStation) {
                setSelectedStation(defaultStation.station_id);
            } else {
                setSelectedStation("");
            }
        }
    }, [usersStations, setSelectedStation]);


    return (
        <Navbar expand="sm" className="bg-body-tertiary">
            <Container fluid>
                <Navbar.Brand as={NavLink} to="/">AudiBird</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/dashboard" end>Dashboard</Nav.Link>
                        <Nav.Link as={NavLink} to="/detections">Detections</Nav.Link>
                        <Nav.Link as={NavLink} to="/analytics" onClick={fetchStationMetadata}>Analytics</Nav.Link>
                            <NavDropdown title={usersStations.find((station) => station.station_id === selectedStation)?.station_name || "Select Station"} id="station-dropdown">
                                {usersStations && usersStations.map((station) => (
                                    <NavDropdown.Item key={station.station_id} value={station.station_id} onClick={() => handleStationChange({ target: { value: station.station_id } })}>
                                        {station.station_name}
                                    </NavDropdown.Item>
                                ))}
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={NavLink} to="/register-station" end>Register New Station</NavDropdown.Item>
                            </NavDropdown>
                    </Nav>
                    <Nav className="ms-auto">
                        <NavDropdown title={<Gear className="me-2" />} id="basic-nav-dropdown" align="end">
                            <NavDropdown.Item as={NavLink} to="/station-settings">Station Settings</NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/preferences">Preferences</NavDropdown.Item>
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