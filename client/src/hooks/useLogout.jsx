import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Hook to handle user logout
export default function useLogout() {
    const navigate = useNavigate();

    const handleLogout = async (event) => {
        if (event) event.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_USER_URL}/logout`);
        } catch (err) {
            console.error("Logout failed:", err);
        }
        localStorage.clear();
        navigate('/');
    };

    return handleLogout;
}