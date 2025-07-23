import React, { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import SocketContext from './contexts/SocketContext';
import ToastNotification from "./components/common/ToastNotification";
import Container from 'react-bootstrap/Container';
import MainNavbar from './components/common/MainNavbar';
import LoginRegister from "./pages/LoginRegister";
import Dashboard from './pages/Dashboard';
import Detections from './pages/Detections';
import PageNotFound from './pages/PageNotFound';


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwt');
  const location = useLocation();
  return (
    token ? children : <Navigate to="/" state={{ from: location }} replace />
  );
};


const App = () => {
  const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, { 
          auth: { token: localStorage.getItem('jwt') },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);


  return (
    <SocketContext.Provider value={socketRef}>
      <Container fluid className="p-2">
        <MainNavbar />
        <ToastContainer />
        <ToastNotification />
        <Routes>
          <Route path="/" element={<LoginRegister />} />
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
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Container>
    </SocketContext.Provider>
  )
  
};

export default App;
