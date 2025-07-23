import { useContext, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import SocketContext from "../../contexts/SocketContext";

// Toast component to display notifications when newDetection event received from socket
const ToastNotification = () => {
    const socketRef = useContext(SocketContext);
    const socket = socketRef.current;

    useEffect(() => {
        if (!socket) {
            console.error("Socket connection not established");
            return;
        }

        const handleNewDetection = (detection) => {
            toast.success(
                `New detection: ${detection.species || detection.common_name} at ${detection.detection_timestamp} (${Math.round(detection.confidence * 100)}%)`,
                {
                    position: "bottom-right",
                    autoClose: 6000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    theme: "colored",
                    transition: Bounce
                }
            );
        };

        socket.on("newDetection", handleNewDetection);


        return () => {
            socket.off("newDetection", handleNewDetection);
        };
    }, [socket]);

    return null; 
};

export default ToastNotification;