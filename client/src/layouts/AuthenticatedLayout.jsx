import { Outlet } from "react-router-dom";
import SocketProvider from '../providers/SocketProvider';
import UserStationsProvider from "../providers/UserStationsProvider";
import SelectedStationProvider from "../providers/SelectedStationProvider";
import StationMetadataProvider from "../providers/StationMetadataProvider";
import UserPreferencesProvider from "../providers/UserPreferencesProvider";
import AudioPlayerProvider from "../providers/AudioPlayerProvider";
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
              <AudioPlayerProvider>
                <Container fluid className="app-shell p-2">
                  <MainNavbar />
                  <ToastContainer />
                  <ToastNotification />
                  <div className="app-content">
                    <Outlet />              {/* Renders the associated child routes */}
                  </div>
                  <MainFooter />
                </Container>
              </AudioPlayerProvider>
            </UserPreferencesProvider>
          </StationMetadataProvider>
        </SelectedStationProvider>
      </UserStationsProvider>
    </SocketProvider>
  );
}