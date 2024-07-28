//frontend/src/components/classAndStudents/ClassManagement.js
import React, { useState, useEffect } from 'react';
import { getClasses, createClass, updateClass, deleteClass } from '../services/classService';

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [newClass, setNewClass] = useState({ name: '', schoolYear: '' });
    const [editingClass, setEditingClass] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const fetchedClasses = await getClasses();
            setClasses(fetchedClasses);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await createClass(newClass);
            setNewClass({ name: '', schoolYear: '' });
            fetchClasses();
        } catch (error) {
            console.error('Failed to create class:', error);
        }
    };

    const handleUpdateClass = async (e) => {
        e.preventDefault();
        try {
            await updateClass(editingClass._id, editingClass);
            setEditingClass(null);
            fetchClasses();
        } catch (error) {
            console.error('Failed to update class:', error);
        }
    };

    const handleDeleteClass = async (classId) => {
        try {
            await deleteClass(classId);
            fetchClasses();
        } catch (error) {
            console.error('Failed to delete class:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Class Management</h2>

            {/* Create Class Form */}
            <form onSubmit={handleCreateClass} className="mb-8">
                <input
                    type="text"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    placeholder="Class Name"
                    className="mr-2 p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    value={newClass.schoolYear}
                    onChange={(e) => setNewClass({ ...newClass, schoolYear: e.target.value })}
                    placeholder="School Year"
                    className="mr-2 p-2 border rounded"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Create Class</button>
            </form>

            {/* Class List */}
            <ul>
                {classes.map((cls) => (
                    <li key={cls._id} className="mb-4 p-4 border rounded">
                        {editingClass && editingClass._id === cls._id ? (
                            <form onSubmit={handleUpdateClass}>
                                <input
                                    type="text"
                                    value={editingClass.name}
                                    onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                                    className="mr-2 p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    value={editingClass.schoolYear}
                                    onChange={(e) => setEditingClass({ ...editingClass, schoolYear: e.target.value })}
                                    className="mr-2 p-2 border rounded"
                                    required
                                />
                                <button type="submit" className="bg-green-500 text-white p-2 rounded mr-2">Save</button>
                                <button onClick={() => setEditingClass(null)} className="bg-gray-500 text-white p-2 rounded">Cancel</button>
                            </form>
                        ) : (
                            <>
                                <span>{cls.name} - {cls.schoolYear}</span>
                                <button onClick={() => setEditingClass(cls)} className="ml-2 bg-yellow-500 text-white p-2 rounded">Edit</button>
                                <button onClick={() => handleDeleteClass(cls._id)} className="ml-2 bg-red-500 text-white p-2 rounded">Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClassManagement;