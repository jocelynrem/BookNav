import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';
import Swal from 'sweetalert2';
import { createClass, updateClass, deleteClass } from '../../services/classService';
import ClassTable from './ClassTable';

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

const ClassManagement = ({ classes, setClasses }) => {
    const [showManagement, setShowManagement] = useState(true);
    const [newClassName, setNewClassName] = useState('');
    const [newClassGrade, setNewClassGrade] = useState('');

    const showNotification = (message, icon) => {
        Swal.fire({
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 3000,
            icon,
            title: message,
        });
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!newClassName.trim() || !newClassGrade) {
            alert("Please enter a class name and select a grade");
            return;
        }
        try {
            const newClass = await createClass({ name: newClassName, grade: newClassGrade });
            setClasses(prevClasses => [...prevClasses, { ...newClass, studentCount: 0 }]);
            setNewClassName('');
            setNewClassGrade('');
            showNotification('Class has been created successfully.', 'success');
        } catch (error) {
            console.error('Failed to create class:', error);
            showNotification('Failed to create class. Please try again.', 'error');
        }
    };

    const handleEditClass = async (updatedClass) => {
        try {
            const result = await updateClass(updatedClass._id, updatedClass);
            setClasses(classes.map(cls => cls._id === updatedClass._id ? { ...result, studentCount: cls.studentCount } : cls));
            showNotification('Class has been updated successfully.', 'success');
        } catch (error) {
            console.error('Failed to update class:', error);
            showNotification('Failed to update class. Please try again.', 'error');
        }
    };

    const handleDeleteClass = async (classId) => {
        try {
            await deleteClass(classId);
            setClasses(classes.filter(cls => cls._id !== classId));
            showNotification('Class has been deleted successfully.', 'success');
        } catch (error) {
            console.error('Failed to delete class:', error);
            showNotification('Failed to delete class. Please try again.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex items-center justify-between">
                    <span className="bg-white pr-3 text-base font-semibold leading-6 text-gray-900">Class Management</span>
                    <button
                        type="button"
                        className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        onClick={() => setShowManagement(!showManagement)}
                    >
                        <PlusIcon className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {showManagement ? 'Hide Management' : 'Show Management'}
                    </button>
                </div>
            </div>

            {showManagement && (
                <div className="space-y-6">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Add a new class</h3>
                            <div className="mt-2 max-w-xl text-sm text-gray-500">
                                <p>Create a new class to manage students.</p>
                            </div>
                            <form onSubmit={handleCreateClass} className="mt-5 sm:flex sm:items-center">
                                <div className="w-full sm:max-w-xs">
                                    <label htmlFor="className" className="sr-only">
                                        Class name
                                    </label>
                                    <input
                                        type="text"
                                        name="className"
                                        id="className"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                        placeholder="Enter class name"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mt-3 sm:ml-4 sm:mt-0 sm:w-40">
                                    <label htmlFor="classGrade" className="sr-only">
                                        Grade
                                    </label>
                                    <select
                                        name="classGrade"
                                        id="classGrade"
                                        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                                        value={newClassGrade}
                                        onChange={(e) => setNewClassGrade(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Grade</option>
                                        {grades.map(grade => (
                                            <option key={grade.value} value={grade.value}>{grade.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900 sm:ml-3 sm:mt-0 sm:w-auto"
                                >
                                    Add Class
                                </button>
                            </form>
                        </div>
                    </div>

                    <ClassTable
                        classes={classes}
                        setClasses={setClasses}
                        handleEditClass={handleEditClass}
                        handleDeleteClass={handleDeleteClass}
                    />
                </div>
            )}
        </div>
    );
};

export default ClassManagement;
