import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import SocketContext from "../contexts/SocketContext";

// SocketProvider component to manage socket connection and listen for events
export default function SocketProvider({ children }) {
    const socketRef = useRef();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("jwt") === null) {
            return;
        }

        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            auth: { token: localStorage.getItem("jwt") },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on("connect", () => {
            console.log("Socket connected:", socketRef.current.id);
            setIsConnected(true);
        });

        socketRef.current.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            setIsConnected(false);
        });

        return () => {
        socketRef.current.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socketRef, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}