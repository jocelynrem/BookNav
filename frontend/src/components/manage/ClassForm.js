import React, { useState, useEffect } from 'react';
import { createClass, updateClass } from '../../services/classService';
import Swal from 'sweetalert2';

const grades = [
    { value: 'K', label: 'Kindergarten' },
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
    { value: '6', label: '6th Grade' },
    { value: '7', label: '7th Grade' },
    { value: '8', label: '8th Grade' },
    { value: '9', label: '9th Grade' },
    { value: '10', label: '10th Grade' },
    { value: '11', label: '11th Grade' },
    { value: '12', label: '12th Grade' },
    { value: 'O', label: 'Other' },
];

const ClassForm = ({ classData, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
    });

    useEffect(() => {
        if (classData) {
            setFormData({
                name: classData.name,
                grade: classData.grade,
            });
        }
    }, [classData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (classData) {
                await updateClass(classData._id, formData);
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Class updated successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await createClass(formData);
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Class created successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save class:', error);
            Swal.fire('Error', 'Failed to save class. Please try again.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Class Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="">Select a grade</option>
                    {grades.map((grade) => (
                        <option key={grade.value} value={grade.value}>
                            {grade.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-teal-700 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-teal-700 text-white rounded-md text-sm font-medium hover:bg-teal-800"
                >
                    {classData ? 'Update' : 'Create'} Class
                </button>
            </div>
        </form>
    );
};

export default ClassForm;