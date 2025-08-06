import { useContext, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import SocketContext from "../../contexts/SocketContext";
import { formatStringToDate } from "../../utils/dateFormatter";

/*
Toast component to display notifications whenever a newDetection event is received from the socket
Uses the SocketContext to listen for new detections on the station specific room
*/
export default function ToastNotification() {
    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewDetection = (detection) => {
            toast.success(
                `New detection: ${detection.species || detection.common_name} at ${formatStringToDate(detection.detection_timestamp)} (${Math.round(detection.confidence * 100)}%)`,
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

        return () => {socket.off("newDetection", handleNewDetection);};
    }, [socket, isConnected]);

    return null; 
}