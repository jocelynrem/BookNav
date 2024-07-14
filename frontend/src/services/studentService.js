//frontend/src/services/studentService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const getStudents = async () => {
    const response = await axios.get(`${API_URL}/students`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const createStudent = async (studentData) => {
    const response = await axios.post(`${API_URL}/students`, studentData, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const updateStudent = async (id, studentData) => {
    const response = await axios.put(`${API_URL}/students/${id}`, studentData, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const deleteStudent = async (id) => {
    const response = await axios.delete(`${API_URL}/students/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const bulkCreateStudents = async (studentsData) => {
    const response = await axios.post(`${API_URL}/students/bulk-create`, studentsData, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getStudentReadingHistory = async (id) => {
    const response = await axios.get(`${API_URL}/students/${id}/reading-history`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};
