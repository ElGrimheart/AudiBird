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

// Private route component - checks if user has a valid token
export default function PrivateRoute({ children }) {
    const token = localStorage.getItem('jwt');
    const location = useLocation();
    return isTokenValid(token) ? children : <Navigate to="/" state={{ from: location }} replace />;
}