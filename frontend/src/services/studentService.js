import axios from 'axios';

let apiUrl;

if (process.env.VERCEL_ENV === 'production') {
    apiUrl = 'https://librarynav-b0a201a9ab3a.herokuapp.com/api';
} else {
    apiUrl = 'https://booknav-backend-d849f051372e.herokuapp.com/api';
}

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