import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Hook to handle user logout. Clears users local data and redirects to landing page.
export default function useLogout() {
    const navigate = useNavigate();

    const handleLogout = async (event) => {
        if (event) event.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_USERS_URL}/logout`);
        } catch (err) {
            console.error("Logout failed:", err);
        }
        localStorage.clear();
        navigate('/');
    };

    return handleLogout;
}