// frontend/src/services/dashboardService.js
import apiClient from './apiClient';
import apiUrl from '../config';


export const getOverdueBooks = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/dashboard/overdue-books`);
        return response.data;
    } catch (error) {
        console.error('Error fetching overdue books:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getOverviewStats = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/dashboard/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getRecentActivity = async () => {
    try {
        const response = await apiClient.get('/dashboard/recent-activity');
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        console.error('Request config:', error.config);
        throw error;
    }
};

export const getReadingTrends = async () => {
    try {
        const response = await apiClient.get('/dashboard/reading-trends');
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        console.error('Request config:', error.config);
        throw error;
    }
};

export const getUpcomingDueDates = async () => {
    try {
        const response = await apiClient.get('/dashboard/upcoming-due-dates');
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        console.error('Request config:', error.config);
        throw error;
    }
};