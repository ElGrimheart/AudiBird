import { useState } from "react";
import axios from "axios";

/*
Hook for reclassifying a detection
Provides a function to reclassify a detection by its ID and the alternative species ID
*/
export default function useReclassifyDetection() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reclassifyDetection = async (stationId, detectionId, alternativePredictionId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_DETECTIONS_URL}/reclassify/${stationId}/${detectionId}`,
                { alternativePredictionId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
            );
            return response.data.result;
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return { reclassifyDetection, loading, error, setError };
}