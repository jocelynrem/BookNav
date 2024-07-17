// frontend/src/services/authService.js

import axios from 'axios';

const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_API_URL
    : process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_DEV_API_URL
        : process.env.REACT_APP_API_URL;

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