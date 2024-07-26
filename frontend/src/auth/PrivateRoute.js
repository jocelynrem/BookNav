// frontend/src/auth/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or any loading component
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
