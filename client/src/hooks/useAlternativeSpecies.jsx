import { useState, useEffect } from "react";
import axios from "axios";

/*
Hook for fetching alternative species details for a specific detection
Returns an array of alternative species predictions including external media links
*/
export default function useAlternativeSpecies(stationId, detectionId) {
    const [alternativeSpecies, setAlternativeSpecies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!detectionId) {
            setAlternativeSpecies([]);
            return;
        }

        const fetchAlternatives = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_DETECTIONS_URL}/alternative-species/${stationId}/${detectionId}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
                );
                setAlternativeSpecies(response.data.result || []);
                console.log("Alternative species data:", response.data.result);
            } catch (error) {
                setError((error.response?.data?.message || "Failed to fetch alternative species"));
                setAlternativeSpecies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAlternatives();
    }, [stationId, detectionId]);

    return { alternativeSpecies, loading, error };
}