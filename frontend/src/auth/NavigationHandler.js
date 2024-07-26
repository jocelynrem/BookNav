// frontend/src/auth/NavigationHandler.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavigationHandler = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const publicRoutes = ['/login', '/register', '/reset-password'];
        const isPublicRoute = publicRoutes.includes(location.pathname);
        const isResetTokenPath = location.pathname.startsWith('/reset/');

        if (isAuthenticated && (isPublicRoute || isResetTokenPath)) {
            navigate('/dashboard', { replace: true });
        } else if (!isAuthenticated && !isPublicRoute && !isResetTokenPath) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, location, navigate]);

    return <>{children}</>;
};

export default NavigationHandler;