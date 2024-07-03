// frontend/src/services/authService.js

import axios from 'axios';

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