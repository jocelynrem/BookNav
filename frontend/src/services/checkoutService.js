import axios from 'axios';

let apiUrl;

if (process.env.VERCEL_ENV === 'production') {
    apiUrl = 'https://librarynav-b0a201a9ab3a.herokuapp.com/api';
} else {
    apiUrl = 'https://booknav-backend-d849f051372e.herokuapp.com/api';
}
export const checkoutBook = async (isbn, studentId) => {
    try {
        const response = await axios.post(`${apiUrl}/checkouts`, { isbn, studentId });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Error checking out book');
    }
};

export const returnBook = async (isbn) => {
    try {
        const response = await axios.post(`${apiUrl}/checkouts/return`, { isbn });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Error returning book');
    }
};