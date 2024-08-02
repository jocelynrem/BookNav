import React, { useState, useEffect } from 'react';
import { createStudent, updateStudent } from '../../services/studentService';
import Swal from 'sweetalert2';

const StudentForm = ({ studentData, classId, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        pin: '',
        readingLevel: '',
    });

    useEffect(() => {
        if (studentData) {
            setFormData({
                firstName: studentData.firstName || '',
                lastName: studentData.lastName || '',
                pin: studentData.pin || '',
                readingLevel: studentData.readingLevel || '',
            });
        }
    }, [studentData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (studentData) {
                await updateStudent(studentData._id, { ...formData, classId });
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Student updated successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await createStudent({ ...formData, classId });
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Student created successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save student:', error);
            Swal.fire('Error', 'Failed to save class. Please try again.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700">PIN</label>
                <input
                    type="text"
                    id="pin"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    required
                    pattern="\d{4}"
                    title="PIN must be a 4-digit number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="readingLevel" className="block text-sm font-medium text-gray-700">Reading Level</label>
                <input
                    type="text"
                    id="readingLevel"
                    name="readingLevel"
                    value={formData.readingLevel}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-pink-600 rounded-md text-sm font-medium text-pink-700 hover:bg-pink-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 text-white rounded-md text-sm font-medium hover:bg-pink-700"
                >
                    {studentData ? 'Update' : 'Create'} Student
                </button>
            </div>
        </form>
    );
};

export default StudentForm;
