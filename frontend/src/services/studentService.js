import axios from 'axios';

const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_API_URL
    : process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_DEV_API_URL
        : process.env.REACT_APP_API_URL;

export const getStudents = async () => {
    const response = await axios.get(`${apiUrl}/students`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const createStudent = async (studentData) => {
    const response = await axios.post(`${apiUrl}/students`, studentData, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const updateStudent = async (id, studentData) => {
    const response = await axios.put(`${apiUrl}/students/${id}`, studentData, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const deleteStudent = async (id) => {
    const response = await axios.delete(`${apiUrl}/students/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const bulkCreateStudents = async (studentsData) => {
    const response = await axios.post(`${apiUrl}/students/bulk-create`, studentsData, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getStudentReadingHistory = async (id) => {
    const response = await axios.get(`${apiUrl}/students/${id}/reading-history`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};