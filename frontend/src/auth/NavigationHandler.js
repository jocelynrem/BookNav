//frontend/src/auth/NavigationHandler.js

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationHandler = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const publicRoutes = ['/login', '/register', '/reset-password'];

        // Check if the current path is the reset password token path
        const isResetTokenPath = location.pathname.startsWith('/reset/');

        if (token && (publicRoutes.includes(location.pathname) || isResetTokenPath)) {
            console.log('Redirecting to home because user is authenticated and trying to access a public route or reset token path.');
            navigate('/', { replace: true });
        } else if (!token && !publicRoutes.includes(location.pathname) && !isResetTokenPath) {
            console.log('Redirecting to login because user is not authenticated and trying to access a private route.');
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    return <>{children}</>;
};

export default NavigationHandler;
