//frontend/src/services/studentService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const getStudents = async () => {
    try {
        const response = await axios.get(`${API_URL}/students`, {
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
        const response = await axios.get(`${API_URL}/students/class/${classId}`, {
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
        const token = localStorage.getItem('token');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.post(`${API_URL}/students`, studentData, config);
        return response.data;
    } catch (error) {
        console.error('Failed to create student:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const response = await axios.put(`${API_URL}/students/${id}`, studentData, {
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
        const response = await axios.delete(`${API_URL}/students/${id}`, {
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
        const response = await axios.post(`${API_URL}/students/bulk-create`, studentsData, {
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
        const response = await axios.get(`${API_URL}/students/${id}/reading-history`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch student reading history:', error);
        throw error;
    }
};
