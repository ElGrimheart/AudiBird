import React, { useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
import { Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import MainNavbar from './components/common/MainNavbar';
import Dashboard from './pages/Dashboard';
import Detections from './pages/Detections';
import PageNotFound from './pages/404';

const App = () => {
  const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io("http://localhost:3002");

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
    <Container fluid className="p-2">
    <MainNavbar />
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/detections" element={<Detections />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    <ToastContainer />
  </Container>
  )
  
};

export default App;
