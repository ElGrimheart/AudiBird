import { Navigate, useLocation } from "react-router-dom";

function isTokenValid(token) {
    if (!token) return false;
    try {
        const [, payload] = token.split('.');
        const { exp } = JSON.parse(atob(payload));
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

// Checks if user has a valid token before rendering protected routes, otherwise re-directs to landing page
export default function PrivateRoute({ children }) {
    const token = localStorage.getItem('jwt');
    const location = useLocation();
    return isTokenValid(token) ? children : <Navigate to="/" state={{ from: location }} replace />;
}