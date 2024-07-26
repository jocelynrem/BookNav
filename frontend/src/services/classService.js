//frontend/src/services/classService.js
import apiUrl from '../config';

export const getClasses = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/classes`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch classes');
    }
    const data = await response.json();
    return data;
};

export const createClass = async (classData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${apiUrl}/classes`, {
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
    const data = await response.json();
    return data;
};

export const updateClass = async (classId, classData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${apiUrl}/classes/${classId}`, {
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
    const data = await response.json();
    return data;
};

export const deleteClass = async (classId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/classes/${classId}`, {
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
