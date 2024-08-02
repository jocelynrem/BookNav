//frontend/src/services/studentService.js
import axios from 'axios';
import apiUrl from '../config';
import apiClient from './apiClient';


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

export const updateStudent = async (studentId, studentData) => {
    try {
        const response = await apiClient.put(`${apiUrl}/students/${studentId}`, studentData);
        return response.data;
    } catch (error) {
        console.error('Failed to update student:', error);
        throw error;
    }
};

export const deleteStudent = async (studentId) => {
    try {
        const response = await apiClient.delete(`${apiUrl}/students/${studentId}`);
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
        console.error('Failed to fetch student reading history:', error);
        throw error;
    }
};

