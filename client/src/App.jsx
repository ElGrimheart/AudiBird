import { Routes, Route } from 'react-router-dom';
import LoginRegister from "./pages/LoginRegister";
import Dashboard from './pages/Dashboard';
import Detections from './pages/Detections';
import Analytics from './pages/Analytics';
import PageNotFound from './pages/PageNotFound';
import AuthenticatedLayout from './layouts/AuthenticatedLayout'; 
import PrivateRoute from './routes/PrivateRoute';

// Main application component - provides routing for the app and handles authentication
export default function App() {
    return (
        <Routes>
            {/* Login page - public route */}
            <Route path="/" element={<LoginRegister />} />

            {/* Private routes - require login */}
            <Route element={<AuthenticatedLayout />}>
                <Route
                    path="/dashboard"
                    element={<PrivateRoute><Dashboard /></PrivateRoute>}
                />
                <Route
                    path="/detections"
                    element={<PrivateRoute><Detections /></PrivateRoute>}
                />
                <Route
                    path="/analytics"
                    element={<PrivateRoute><Analytics /></PrivateRoute>}
                />
                <Route
                    path="*"
                    element={<PrivateRoute><PageNotFound /></PrivateRoute>}
                />
            </Route>
        </Routes>
    );
}