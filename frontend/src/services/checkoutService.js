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
        const response = await axiosInstance.put(`/checkouts/${checkoutRecordId}/return`, {
            returnedOn: new Date().toISOString()
        });
        return response.data;
    } catch (error) {
        console.error('Error returning book:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Convert ISBN-10 to ISBN-13
const convertToISBN13 = (isbn10) => {
    const prefix = '978';
    const isbn13WithoutChecksum = prefix + isbn10.slice(0, -1);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(isbn13WithoutChecksum[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return isbn13WithoutChecksum + checksum;
};

// return a book by ISBN
export const returnBookByISBN = async (isbn) => {
    try {
        let normalizedISBN = isbn;

        // Convert to ISBN-13 if necessary
        if (isbn.length === 10) {
            normalizedISBN = convertToISBN13(isbn);
        } else if (!isbn.startsWith('978')) {
            normalizedISBN = `978${isbn}`; // Ensure it starts with '978' for ISBN-13 format
        }
        console.log(`Sending return request for ISBN: ${normalizedISBN}`);
        const response = await axiosInstance.put('/checkouts/return-by-isbn', { isbn: normalizedISBN });
        console.log('Return book response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error returning book by ISBN:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
        // Error handling...
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
