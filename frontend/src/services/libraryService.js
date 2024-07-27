import apiClient from './apiClient';
import apiUrl from '../config';

export const getLibrarySettings = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/library/settings`);
        return response.data;
    } catch (error) {
        console.error('Error fetching library settings:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateLibrarySettings = async (settings) => {
    try {
        const response = await apiClient.put(`${apiUrl}/library/settings`, settings);
        return response.data;
    } catch (error) {
        console.error('Error updating library settings:', error.response ? error.response.data : error.message);
        throw error;
    }
};