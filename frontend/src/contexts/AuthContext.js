// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedRole = localStorage.getItem('userRole');
        if (token && storedRole) {
            setIsAuthenticated(true);
            setUserRole(storedRole);
        }
        setLoading(false);
    }, []);

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