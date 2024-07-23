import axios from 'axios';

let apiUrl;

if (process.env.VERCEL_ENV === 'production') {
    apiUrl = 'https://librarynav-b0a201a9ab3a.herokuapp.com/api';
} else {
    apiUrl = 'https://booknav-backend-d849f051372e.herokuapp.com/api';
}

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

export const getStudentCheckouts = async (studentId) => {
    try {
        console.log('Fetching checkouts for student:', studentId);
        const response = await axiosInstance.get(`/checkouts/student/${studentId}`);
        console.log('Checkout response:', response.data);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching student checkouts:', error.response ? error.response.data : error.message);
        return [];
    }
};

export const checkBookStatus = async (isbn, studentId) => {
    try {
        const response = await axiosInstance.get(`/checkouts/status`, { params: { isbn, studentId } });
        return response.data;
    } catch (error) {
        console.error('Error checking book status:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const returnBook = async (checkoutRecordId, returnedOn) => {
    try {
        const response = await axiosInstance.put(`/checkouts/${checkoutRecordId}/return`, { returnedOn });
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

export const checkoutBook = async (bookCopyId, studentId, dueDate) => {
    try {
        const response = await axiosInstance.post(`/checkouts`, { bookCopyId, studentId, dueDate });
        return response.data;
    } catch (error) {
        console.error('Error checking out book:', error.response ? error.response.data : error.message);
        throw error;
    }
};