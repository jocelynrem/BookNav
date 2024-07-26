// frontend/src/services/authService.js

import axios from 'axios';
import apiClient from './apiClient';
import apiUrl from '../config';


export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post(`${apiUrl}/auth/register`, userData);
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await apiClient.post(`${apiUrl}/auth/login`, credentials);
        const data = response.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userRole', data.role);
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    localStorage.removeItem('currentRoute'); // Clear the saved route
    localStorage.removeItem('userBooks'); // Clear user-specific books data
};

export const sendPasswordResetEmail = async (email) => {
    const response = await axios.post(`${apiUrl}/auth/reset-password`, { email });
    return response.data;
};

export const resetPassword = async (token, password) => {
    try {
        const response = await axios.post(`${apiUrl}/auth/reset/${token}`, { password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    try {
        const response = await apiClient.get(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};