import axios from 'axios';

let apiUrl;

if (process.env.VERCEL_ENV === 'production') {
    apiUrl = 'https://librarynav-b0a201a9ab3a.herokuapp.com/api';
} else {
    apiUrl = 'https://booknav-backend-d849f051372e.herokuapp.com/api';
}

export const getStudentCheckouts = async (studentId) => {
    try {
        const response = await axios.get(`${apiUrl}/checkouts/student/${studentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student checkouts:', error);
        throw error;
    }
};

export const returnBook = async (bookId) => {
    try {
        const response = await axios.post(`${apiUrl}/checkouts/return`, { bookId });
        return response.data;
    } catch (error) {
        console.error('Error returning book:', error);
        throw error;
    }
};

export const searchBooks = async (query) => {
    try {
        const response = await axios.get(`${apiUrl}/books/search`, { params: { q: query } });
        return response.data;
    } catch (error) {
        console.error('Error searching books:', error);
        throw error;
    }
};

export const checkoutBook = async (bookId, studentId) => {
    try {
        const response = await axios.post(`${apiUrl}/checkouts`, { bookId, studentId });
        return response.data;
    } catch (error) {
        console.error('Error checking out book:', error);
        throw error;
    }
};

export const checkBookStatus = async (isbn, studentId) => {
    try {
        const response = await axios.get(`${apiUrl}/checkouts/status`, { params: { isbn, studentId } });
        return response.data;
    } catch (error) {
        console.error('Error checking book status:', error);
        throw error;
    }
};