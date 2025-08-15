import { useState } from 'react';
import axios from 'axios';

/*
Hook for registering a new station.
On success, updates the user's JWT token with the new station and access permissions.
*/
export default function useRegisterStation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const registerStation = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_STATIONS_URL}/register`,
                values,
                { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
            );

            if (response.status === 200 && response.data.result) {
                const token = response.data.result.jwt;
                localStorage.setItem('jwt', token);
            }
            return response;
        } catch (error) {
            setError('Failed to register station.');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, registerStation };
}