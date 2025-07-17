import React, { useEffect, useRef } from "react";
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
import SocketContext from './contexts/SocketContext';
import Container from 'react-bootstrap/Container';
import MainNavbar from './components/common/MainNavbar';
import Dashboard from './pages/Dashboard';
import Detections from './pages/Detections';
import PageNotFound from './pages/404';

const App = () => {
  const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

        socketRef.current.on("newDetection", (detection) => {
            toast.success(
              `New detection: ${detection.species || detection.common_name} at ${detection.detection_timestamp} (${Math.round(detection.confidence * 100)}%)`,
              { position: "bottom-right", autoClose: 6000 }
            );
        });

        return () => {
            socketRef.current.off("newDetection");
            socketRef.current.disconnect();
        };
    }, []);


  return (
    <SocketContext.Provider value={socketRef}>
      <Container fluid className="p-2">
        <MainNavbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/detections" element={<Detections />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <ToastContainer />
      </Container>
    </SocketContext.Provider>
  )
  
};

export default App;
