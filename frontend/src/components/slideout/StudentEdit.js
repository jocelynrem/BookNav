import React, { useState, useEffect } from 'react';
import { ArrowRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const StudentEdit = ({ student, onSave, onClose, onView, onDelete, classes }) => {
    const [editingStudent, setEditingStudent] = useState(student);

    useEffect(() => {
        setEditingStudent(student);
    }, [student]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingStudent({ ...editingStudent, [name]: value });
    };

    const handleClassChange = (e) => {
        const selectedClassId = e.target.value;
        const selectedClass = classes.find(cls => cls._id === selectedClassId);
        setEditingStudent({
            ...editingStudent,
            class: selectedClass,
            grade: selectedClass ? selectedClass.grade : ''
        });
    };

    const handleSave = () => {
        onSave(editingStudent);
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you really want to delete ${editingStudent.firstName} ${editingStudent.lastName}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(editingStudent._id);
                onClose();
                Swal.fire(
                    'Deleted!',
                    'The student has been deleted.',
                    'success'
                );
            }
        });
    };

    const renderField = (label, name, type = "text") => (
        <label className="block mb-2">
            {label}
            <input
                type={type}
                name={name}
                value={editingStudent[name] || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
            />
        </label>
    );

    return (
        <div className="space-y-4 pb-8">
            <div className="flex justify-between items-center pb-2">
                <button
                    type="button"
                    className="flex items-center text-teal-700 hover:text-teal-900"
                    onClick={onView}
                >
                    View student details
                    <ArrowRightIcon className="ml-1 h-5 w-5" />
                </button>
            </div>
            {renderField("First Name", "firstName")}
            {renderField("Last Name", "lastName")}
            <div className="flex items-center space-x-4">
                <div className="flex-grow">
                    <label className="block mb-2">
                        Class
                        <select
                            name="class"
                            value={editingStudent.class ? editingStudent.class._id : ''}
                            onChange={handleClassChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                        >
                            <option value="">Select a class</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="w-1/4">
                    <label className="block mb-2">
                        Grade
                        <div className="block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 sm:text-sm">
                            {editingStudent.grade || 'N/A'}
                        </div>
                    </label>
                </div>
            </div>
            {renderField("Reading Level", "readingLevel")}
            {renderField("PIN", "pin", "text")}
            <div className="flex justify-end space-x-4 px-4 py-4 sm:px-6">
                <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
                    onClick={handleSave}
                >
                    Save
                </button>
                <button
                    type="button"
                    className="inline-flex justify-center items-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={handleDelete}
                >
                    Delete
                    <TrashIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

export default StudentEdit;
