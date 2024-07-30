import apiClient from './apiClient';
import apiUrl from '../config';

// Helper function for logging errors with detailed information
const logError = (context, error) => {
    console.error(`${context} - Error details:`, error.response ? error.response.data : error.message);
    console.error('Request config:', error.config);
};

export const getOverdueBooks = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/dashboard/overdue-books`);
        return response.data;
    } catch (error) {
        logError('getOverdueBooks', error);
        throw error;
    }
};

export const getOverviewStats = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/dashboard/stats`);
        return response.data;
    } catch (error) {
        logError('getOverviewStats', error);
        throw error;
    }
};

export const getRecentActivity = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/dashboard/recent-activity`);
        return response.data;
    } catch (error) {
        logError('getRecentActivity', error);
        throw error;
    }
};

export const getReadingTrends = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/dashboard/reading-trends`);
        return response.data;
    } catch (error) {
        logError('getReadingTrends', error);
        throw error;
    }
};

export const getUpcomingDueDates = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/dashboard/upcoming-due-dates`);
        return response.data;
    } catch (error) {
        logError('getUpcomingDueDates', error);
        throw error;
    }
};

export const getCheckedOutBooks = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/dashboard/checked-out-books`);
        return response.data;
    } catch (error) {
        logError('getCheckedOutBooks', error);
        throw error;
    }
};
