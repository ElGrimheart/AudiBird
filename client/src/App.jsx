import React from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { SocketProvider } from './providers/SocketProvider';
import { UserStationsProvider } from "./providers/UserStationsProvider";
import { SelectedStationProvider } from "./providers/SelectedStationProvider";
import AudioPlayerProvider from "./providers/AudioPlayerProvider";
import ToastNotification from "./components/common/ToastNotification";
import Container from 'react-bootstrap/Container';
import MainNavbar from './components/common/MainNavbar';
import MainFooter from './components/common/MainFooter';
import LoginRegister from "./pages/LoginRegister";
import Dashboard from './pages/Dashboard';
import Detections from './pages/Detections';
import Analytics from './pages/Analytics';
import PageNotFound from './pages/PageNotFound';
// wrap providers into single component

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('jwt');
    const location = useLocation();
    return (
        token ? children : <Navigate to="/" state={{ from: location }} replace />
    );
};


const App = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginRegister />} />
            <Route path="*" element= {
                <SocketProvider>
                    <UserStationsProvider>
                        <SelectedStationProvider>
                            <AudioPlayerProvider>
                                <Container fluid className="p-2">
                                    <MainNavbar />
                                    <ToastContainer />
                                    <ToastNotification />
                                    <Routes>
                                        <Route
                                          path="/dashboard"
                                          element={
                                            <PrivateRoute>
                                              <Dashboard />
                                            </PrivateRoute>
                                          }
                                        />
                                        <Route
                                          path="/detections"
                                          element={
                                            <PrivateRoute>
                                              <Detections />
                                            </PrivateRoute>
                                          }
                                        />
                                        <Route
                                            path="/analytics"
                                            element={
                                                <PrivateRoute>
                                                    <Analytics />
                                                </PrivateRoute>
                                            }
                                        />
                                        <Route path="*" element={<PageNotFound />} />
                                    </Routes>
                                    <MainFooter />
                                </Container>
                            </AudioPlayerProvider>
                        </SelectedStationProvider>
                    </UserStationsProvider>
                </SocketProvider> 
            } 
            />
        </Routes>
    );
};

export default App;
