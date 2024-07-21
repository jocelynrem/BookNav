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
        const response = await axios.get(`${apiUrl}/students/class/${classId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch students by class:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request data:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        throw error;
    }
};

export const createStudent = async (studentData) => {
    try {
        const token = localStorage.getItem('token');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.post(`${apiUrl}/students`, studentData, config);
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

export const getStudentReadingHistory = async (id) => {
    try {
        const response = await axios.get(`${apiUrl}/students/${id}/reading-history`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch student reading history:', error);
        throw error;
    }
};
