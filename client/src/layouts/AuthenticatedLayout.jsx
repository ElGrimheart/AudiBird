import { Outlet } from "react-router-dom";
import SocketProvider from '../providers/SocketProvider';
import UserStationsProvider from "../providers/UserStationsProvider";
import SelectedStationProvider from "../providers/SelectedStationProvider";
import StationMetadataProvider from "../providers/StationMetadataProvider";
import UserPreferencesProvider from "../providers/UserPreferencesProvider";
import Container from 'react-bootstrap/Container';
import MainNavbar from '../components/common/MainNavbar';
import MainFooter from '../components/common/MainFooter';
import { ToastContainer } from "react-toastify";
import ToastNotification from "../components/common/ToastNotification";

// Wrapper for all private routes. Includes global context providers.
export default function AuthenticatedLayout() {
  return (
    <SocketProvider>
      <UserStationsProvider>
        <SelectedStationProvider>
          <StationMetadataProvider>
            <UserPreferencesProvider>
                <Container fluid className="app-wrapper">
                  <MainNavbar />
                  <ToastContainer />
                  <ToastNotification />
                  <div className="app-content">
                    <Outlet />                    {/* Renders the associated child routes */}
                  </div>
                  <MainFooter />
                </Container>
            </UserPreferencesProvider>
          </StationMetadataProvider>
        </SelectedStationProvider>
      </UserStationsProvider>
    </SocketProvider>
  );
}