// frontend/src/services/classService.js
const API_URL = process.env.REACT_APP_API_URL;

export const getClasses = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/classes`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch classes');
    }
    return await response.json();
};

export const createClass = async (classData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(classData)
    });
    if (!response.ok) {
        throw new Error('Failed to create class');
    }
    return await response.json();
};

export const updateClass = async (classId, classData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/classes/${classId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(classData)
    });
    if (!response.ok) {
        throw new Error('Failed to update class');
    }
    return await response.json();
};

export const deleteClass = async (classId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/classes/${classId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to delete class');
    }
    return await response.json();
};
