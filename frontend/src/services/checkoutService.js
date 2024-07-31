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

const handleError = (error, customMessage) => {
    console.error(customMessage, error.response ? error.response.data : error.message);
    throw error;
};

export const getCurrentCheckouts = async (studentId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/student/${studentId}/current`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        handleError(error, 'Error fetching current checkouts:');
    }
};

export const getCheckoutHistory = async (studentId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/student/${studentId}/history`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        handleError(error, 'Error fetching checkout history:');
    }
};

export const checkBookStatus = async (isbn, studentId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/status`, { params: { isbn, studentId } });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Book not found');
        }
        handleError(error, 'Error checking book status:');
    }
};

export const returnBook = async (checkoutId) => {
    try {
        if (!checkoutId) throw new Error("Checkout ID is required");
        const response = await axiosInstance.put(`/checkouts/${checkoutId}/return`, {
            returnedOn: new Date().toISOString()
        });
        return response.data;
    } catch (error) {
        handleError(error, 'Error returning book:');
    }
};

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

export const returnBookByISBN = async (isbn) => {
    try {
        let normalizedISBN = isbn.length === 10 ? convertToISBN13(isbn) : isbn;
        normalizedISBN = normalizedISBN.startsWith('978') ? normalizedISBN : `978${normalizedISBN}`;
        const response = await axiosInstance.put('/checkouts/return-by-isbn', { isbn: normalizedISBN });
        return response.data;
    } catch (error) {
        handleError(error, 'Error returning book by ISBN:');
    }
};

export const searchBooks = async (query) => {
    try {
        const response = await axiosInstance.get(`/books/search`, { params: { q: query } });
        // Log the response data to see what we're getting from the server
        return response.data;
    } catch (error) {
        handleError(error, 'Error searching books:');
    }
};

export const getCurrentCheckoutsForBook = async (bookId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/book/${bookId}/all`);
        const allCheckouts = response.data;
        const currentCheckouts = allCheckouts.filter(checkout => checkout.status === 'checked out');
        return { currentCheckouts, allCheckouts };
    } catch (error) {
        handleError(error, `Error fetching checkouts for book ${bookId}:`);
    }
};

export const checkoutBook = async (bookId, studentId) => {
    try {
        const response = await axiosInstance.post(`/checkouts`, { bookId, studentId });
        return response.data;
    } catch (error) {
        handleError(error, 'Error checking out book:');
    }
};

export const getBookCopyCheckouts = async (bookCopyId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/bookcopy/${bookCopyId}`);
        return response.data;
    } catch (error) {
        handleError(error, 'Error fetching checkout history for book copy:');
    }
};

export const getDetailedReadingHistory = async (studentId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/student/${studentId}/detailed-history`);
        return response.data;
    } catch (error) {
        handleError(error, 'Error fetching detailed reading history:');
    }
};

export const getOverdueBooks = async () => {
    try {
        const response = await axiosInstance.get('/checkouts/overdue');
        return response.data;
    } catch (error) {
        handleError(error, 'Error fetching overdue books:');
    }
};

export const getCheckedOutBooks = async () => {
    try {
        const response = await axiosInstance.get('/checkouts/checked-out');
        return response.data;
    } catch (error) {
        handleError(error, 'Error fetching checked out books:');
    }
};