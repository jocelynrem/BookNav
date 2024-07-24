//frontend/src/services/studentService.js
import axios from 'axios';

let apiUrl;

if (process.env.VERCEL_ENV === 'production') {
    apiUrl = 'https://librarynav-b0a201a9ab3a.herokuapp.com/api';
} else {
    apiUrl = 'https://booknav-backend-d849f051372e.herokuapp.com/api';
}

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

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

export const getStudents = async () => {
    try {
        const response = await axios.get(`${apiUrl}/students`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch students:', error);
        throw error;
    }
};

export const getStudentsByClass = async (classId) => {
    try {
        const url = classId === 'all'
            ? `${apiUrl}/students`
            : `${apiUrl}/students/class/${classId}`;
        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch students by class:', error);
        throw error;
    }
};

export const createStudent = async (studentData) => {
    try {
        const response = await axios.post(`${apiUrl}/students`, studentData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create student:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const response = await axios.put(`${apiUrl}/students/${id}`, studentData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to update student:', error);
        throw error;
    }
};

export const deleteStudent = async (id) => {
    try {
        const response = await axios.delete(`${apiUrl}/students/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to delete student:', error);
        throw error;
    }
};

export const bulkCreateStudents = async (studentsData) => {
    try {
        const response = await axios.post(`${apiUrl}/students/bulk-create`, studentsData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to bulk create students:', error);
        throw error;
    }
};

export const getStudentReadingHistory = async (studentId) => {
    try {
        const response = await axiosInstance.get(`/students/${studentId}/reading-history`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch student reading history:', error.response ? error.response.data : error.message);
        console.error('Error details:', error);
        throw error;
    }
};

