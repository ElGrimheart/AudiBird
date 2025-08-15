import React, { useContext, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import SocketContext from "../../contexts/SocketContext";
import UserPreferencesContext from "../../contexts/UserPreferencesContext";
import { formatStringToDate } from "../../utils/date-formatter";

/*
Toast component to display notifications whenever a newDetection event is received from the socket
Uses the SocketContext to listen for new detections on the station specific room.
Checks if newDetection event meets user preferences for in-app notifications and confidence threshold.
*/
export default function ToastNotification() {
    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;
    
    const { userPreferences } = useContext(UserPreferencesContext);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewDetection = (detection) => {
            // check if user preferences allow for in-app notifications and confidence threshold
            if (!userPreferences.newDetectionInApp || detection.confidence < userPreferences.newDetectionInAppThreshold) {
                return;
            }

            // display toast
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
    }, [socket, isConnected, userPreferences]);

    return null; 
}