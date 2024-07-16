import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const checkoutBook = async (isbn, studentId) => {
    try {
        const response = await axios.post(`${API_URL}/checkouts`, { isbn, studentId });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Error checking out book');
    }
};

export const returnBook = async (isbn) => {
    try {
        const response = await axios.post(`${API_URL}/checkouts/return`, { isbn });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Error returning book');
    }
};