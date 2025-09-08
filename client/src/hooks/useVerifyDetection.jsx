import { useState } from 'react';
import axios from 'axios';

/*
Hook for verifying a detection
*/
export default function useVerifyDetection() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const verifyDetection = async (stationId, detectionId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_DETECTIONS_URL}/verify/${stationId}/${detectionId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
                }
            );
            return response.data.result;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { verifyDetection, loading, error, setError };
}