import { useState } from 'react';
import axios from 'axios';

/*
Hook for deleting a detection
*/
export default function useDeleteDetection() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteDetection = async (stationId, detectionId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_DETECTIONS_URL}/delete/${stationId}/${detectionId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
            });
            return response.data;
        } catch (error) {
            console.log("Delete detection error:", error);
            setError(error.response?.data?.message || "Failed to delete detection");
        } finally {
            setLoading(false);
        }
    };

    return { deleteDetection, loading, error, setError };
}