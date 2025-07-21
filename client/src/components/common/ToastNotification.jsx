import { useContext, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import SocketContext from "../../contexts/SocketContext";

// Toast component to display notifications for new detections
const ToastNotification = () => {
    const socketRef = useContext(SocketContext);
    const socket = socketRef.current;

    useEffect(() => {
        

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

        if (!socket) 
            return;

        socket.on("newDetection", handleNewDetection);
        return () => {
            socket.off("newDetection", handleNewDetection);
        };
    }, [socket]);

    return null; // This component does not render anything
};

export default ToastNotification;