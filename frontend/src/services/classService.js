import apiClient from './apiClient';
import apiUrl from '../config';

export const getClasses = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/classes`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch classes:', error);
        throw error;
    }
};

export const createClass = async (classData) => {
    try {
        const response = await apiClient.post(`${apiUrl}/classes`, classData);
        return response.data;
    } catch (error) {
        console.error('Failed to create class:', error);
        throw error;
    }
};

export const updateClass = async (classId, classData) => {
    try {
        const response = await apiClient.put(`${apiUrl}/classes/${classId}`, classData);
        return response.data;
    } catch (error) {
        console.error('Failed to update class:', error);
        throw error;
    }
};

export const deleteClass = async (classId) => {
    try {
        const response = await apiClient.delete(`${apiUrl}/classes/${classId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete class:', error);
        throw error;
    }
};

export const getStudentsByClass = async (classId) => {
    try {
        const response = await apiClient.get(`${apiUrl}/students/class/${classId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch students by class:', error);
        throw error;
    }
};

export const moveStudent = async (studentId, newClassId) => {
    try {
        const response = await apiClient.put(`${apiUrl}/students/${studentId}/move`, { newClassId });
        return response.data;
    } catch (error) {
        console.error('Failed to move student:', error);
        throw error;
    }
};