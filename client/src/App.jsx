import React, { useEffect, useRef } from "react";
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import SocketContext from './contexts/SocketContext';
import ToastNotification from "./components/common/ToastNotification";
import Container from 'react-bootstrap/Container';
import MainNavbar from './components/common/MainNavbar';
import AuthPage from "./pages/AuthPage";
import Dashboard from './pages/Dashboard';
import Detections from './pages/Detections';
import PageNotFound from './pages/PageNotFound';

const App = () => {
  const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

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
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/detections" element={<Detections />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Container>
    </SocketContext.Provider>
  )
  
};

export default App;
