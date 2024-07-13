import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import Swal from 'sweetalert2';
import { createClass, updateClass, deleteClass } from '../../services/classService';

const ClassManagement = ({ classes, setClasses, selectedClass, setSelectedClass }) => {
    const [showAddClass, setShowAddClass] = useState(classes.length === 0);
    const [newClassName, setNewClassName] = useState('');
    const [editClassId, setEditClassId] = useState('');
    const [editClassName, setEditClassName] = useState('');

    useEffect(() => {
        if (classes.length === 1) {
            setEditClassId(classes[0]._id);
            setEditClassName(classes[0].name);
        } else {
            setEditClassId('');
            setEditClassName('');
        }
    }, [classes]);

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
        if (!newClassName.trim()) {
            alert("Please enter a class name");
            return;
        }
        try {
            const newClass = await createClass({ name: newClassName });
            setClasses(prevClasses => [...prevClasses, newClass]);
            setNewClassName('');
            setSelectedClass(newClass);
            showNotification('Class has been created successfully.', 'success');
        } catch (error) {
            console.error('Failed to create class:', error);
            alert("Failed to create class. Please try again.");
        }
    };

    const handleEditClass = async (e) => {
        e.preventDefault();
        if (!editClassName.trim()) {
            alert("Please enter a class name");
            return;
        }
        try {
            const updatedClass = await updateClass(editClassId, { name: editClassName });
            setClasses(classes.map(cls => cls._id === editClassId ? updatedClass : cls));
            setEditClassId('');
            setEditClassName('');
            setSelectedClass(updatedClass);
            showNotification('Class has been updated successfully.', 'success');
        } catch (error) {
            console.error('Failed to update class:', error);
            alert("Failed to update class. Please try again.");
        }
    };

    const handleDeleteClass = async (classId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteClass(classId);
                    setClasses(classes.filter(cls => cls._id !== classId));
                    setSelectedClass(classes.length > 1 ? classes[0] : null);
                    setEditClassId('');
                    setEditClassName('');
                    showNotification('Your class has been deleted.', 'success');
                } catch (error) {
                    console.error('Failed to delete class:', error);
                    Swal.fire(
                        'Failed!',
                        'Failed to delete class. Please try again.',
                        'error'
                    );
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire(
                    'Cancelled',
                    'Your class is safe :)',
                    'error'
                );
            }
        });
    };

    return (
        <div>
            <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex items-center justify-between">
                    <span className="bg-white pr-3 text-base font-semibold leading-6 text-gray-900">Class Management</span>
                    <button
                        type="button"
                        className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        onClick={() => setShowAddClass(!showAddClass)}
                    >
                        <PlusIcon aria-hidden="true" className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400" />
                        {showAddClass ? 'Hide' : 'Add or Edit a Class'}
                    </button>
                </div>
            </div>

            {showAddClass && (
                <div className="mt-8 bg-white shadow sm:rounded-lg">
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
                            <button
                                type="submit"
                                className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:ml-3 sm:mt-0 sm:w-auto"
                            >
                                Add
                            </button>
                        </form>
                        {classes.length > 0 && (
                            <div className="py-9">
                                <span className="bg-white pr-3 text-base font-semibold leading-6 text-gray-900">Edit or Delete a Class</span>
                                {classes.length > 1 && (
                                    <div className="flex justify-between mt-2">
                                        <div className="flex-grow">
                                            <label htmlFor="editClassSelect" className="sr-only">
                                                Select class to edit or delete
                                            </label>
                                            <select
                                                id="editClassSelect"
                                                name="editClassSelect"
                                                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                                                value={editClassId}
                                                onChange={(e) => {
                                                    const selectedClass = classes.find(c => c._id === e.target.value);
                                                    setEditClassId(e.target.value);
                                                    setEditClassName(selectedClass ? selectedClass.name : '');
                                                }}
                                                required
                                            >
                                                <option value="" disabled>Select a class</option>
                                                {classes.map((cls) => (
                                                    <option key={cls._id} value={cls._id}>
                                                        {cls.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {editClassId && (
                                    <div className="mt-4 sm:flex sm:items-center">
                                        <form onSubmit={handleEditClass} className="flex items-center w-full">
                                            <div className="flex-grow">
                                                <label htmlFor="editClassName" className="sr-only">
                                                    New class name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="editClassName"
                                                    id="editClassName"
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                                    placeholder="Enter new class name"
                                                    value={editClassName}
                                                    onChange={(e) => setEditClassName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="ml-3 inline-flex items-center rounded-md bg-teal-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                                            >
                                                Update Class Name
                                            </button>
                                            <button
                                                type="button"
                                                className="ml-3 inline-flex items-center rounded-md bg-red-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
                                                onClick={() => handleDeleteClass(editClassId)}
                                            >
                                                Delete This Class
                                                <TrashIcon aria-hidden="true" className="-mr-0.5 h-4 w-4" />
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassManagement;
