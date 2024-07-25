// frontend/src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Change this line

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedRole = localStorage.getItem('userRole');
        if (token && storedRole && !isTokenExpired(token)) {
            setIsAuthenticated(true);
            setUserRole(storedRole);
        } else {
            setIsAuthenticated(false);
            setUserRole(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = localStorage.getItem('token');
            if (token && isTokenExpired(token)) {
                setIsAuthenticated(false);
                setUserRole(null);
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                navigate('/login');
            }
        };

        const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, [navigate]);

    const login = (token, role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setUserRole(null);
        navigate('/login');
    };

    if (loading) {
        return <div>Loading...</div>; // Or any loading indicator
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);