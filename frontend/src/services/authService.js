// frontend/src/services/authService.js

import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const sendPasswordResetEmail = async (email) => {
    const response = await axios.post(`${API_URL}/reset-password`, { email });
    return response.data;
};

export const resetPassword = async (token, password) => {
    const response = await axios.post(`${API_URL}/reset/${token}`, { password });
    return response.data;
};
