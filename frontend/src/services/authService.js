// frontend/src/services/authService.js

import axios from 'axios';
import apiClient from './apiClient';

const API_URL = process.env.REACT_APP_API_URL;

export const sendPasswordResetEmail = async (email) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { email });
    return response.data;
};

export const resetPassword = async (token, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset/${token}`, { password });
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