import { useState } from 'react';
import axios from 'axios';

/*
Hook for protecting audio
*/
export default function useProtectAudio() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const protectAudio = async (stationId, audioId, protect) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_AUDIO_URL}/protect/${stationId}/${audioId}`,
                { protectAudio: protect },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
                }
            );
            return response.data.result;
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { protectAudio, loading, error, setError };
}