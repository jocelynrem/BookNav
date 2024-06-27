import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationHandler = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedRoute = localStorage.getItem('currentRoute');

        if (token && savedRoute) {
            navigate(savedRoute);
        } else if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return <>{children}</>;
};

export default NavigationHandler;
