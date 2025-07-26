import React, { useState, useEffect, useContext, useRef } from 'react';
import SelectedStationContext from '../contexts/SelectedStationContext';
import SocketContext from '../contexts/SocketContext';

// Provider component to manage user switching between stations and update socket connections
export const SelectedStationProvider = ({ children }) => {
    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;
    const prevStationRef = useRef();
    const [selectedStation, setSelectedStation] = useState(() => {
        return localStorage.getItem("selectedStation") || "";
    });

    useEffect(() => {
        if (!socket || !isConnected ) return;

        try {
            localStorage.setItem("selectedStation", selectedStation);
            console.log(`Selected station changed to: ${selectedStation}`);

            if (prevStationRef.current) {
                socket.emit("leaveStation", prevStationRef.current);
            }

            if (selectedStation) {
                socket.emit("joinStation", selectedStation, (response) => {
                    console.log("Server acknowledged join:", response);
                });
                console.log(`Join request sent for station room: ${selectedStation}`);
            }

            prevStationRef.current = selectedStation;
        } catch (error) {
            console.error("Error setting selected station:", error);
        } 
    }, [selectedStation, socket, isConnected]);

    return (
        <SelectedStationContext.Provider value={{ selectedStation, setSelectedStation }}>
            {children}
        </SelectedStationContext.Provider>
    );
};

export default SelectedStationProvider;