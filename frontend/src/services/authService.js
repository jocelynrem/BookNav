// frontend/src/services/authService.js

import axios from 'axios';

let apiUrl;

if (process.env.VERCEL_ENV === 'production') {
    apiUrl = 'https://librarynav-b0a201a9ab3a.herokuapp.com/api';
} else {
    apiUrl = 'https://booknav-backend-d849f051372e.herokuapp.com/api';
}

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