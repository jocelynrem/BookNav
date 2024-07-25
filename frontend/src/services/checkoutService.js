import axios from 'axios';
import apiUrl from '../config';


const axiosInstance = axios.create({
    baseURL: apiUrl,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Fetch only current checkouts for a student
export const getCurrentCheckouts = async (studentId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/student/${studentId}/current`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching current checkouts:', error.response ? error.response.data : error.message);
        return [];
    }
};

// Fetch the entire checkout history for a student
export const getCheckoutHistory = async (studentId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/student/${studentId}/history`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching checkout history:', error.response ? error.response.data : error.message);
        return [];
    }
};

export const checkBookStatus = async (isbn, studentId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/status`, { params: { isbn, studentId } });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('Book not found:', error.response.data.message);
            throw new Error('Book not found');
        }
        console.error('Error checking book status:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const returnBook = async (checkoutRecordId) => {
    try {
        // Send a request to mark the book as returned
        const response = await axiosInstance.put(`/checkouts/${checkoutRecordId}/return`, {
            returnedOn: new Date().toISOString() // Send the current date as an ISO string
        });
        return response.data;
    } catch (error) {
        console.error('Error returning book:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const searchBooks = async (query) => {
    try {
        const response = await axiosInstance.get(`/books/search`, { params: { q: query } });
        return response.data;
    } catch (error) {
        console.error('Error searching books:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const checkoutBook = async (bookId, studentId) => {
    try {
        const response = await axiosInstance.post('/checkouts', { bookId, studentId });
        return response.data;
    } catch (error) {
        console.error('Error checking out book:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getBookCopyCheckouts = async (bookCopyId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/bookcopy/${bookCopyId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching checkout history for book copy:', error.response ? error.response.data : error.message);
        throw error;
    }
};
