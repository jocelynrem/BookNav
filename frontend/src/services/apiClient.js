// src/services/apiClient.js

import axios from 'axios';
import apiUrl from '../config';
import { refreshToken } from './authService';

const apiClient = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Clear local storage and update auth context
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            // You'll need to implement this function in your AuthContext
            await logout();
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
