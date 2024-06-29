//frontend/src/auth/AuthCheck.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCheck = ({ children }) => {
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

    return children;
};

export default AuthCheck;
