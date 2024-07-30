//frontend/src/components/classAndStudents/StudentManagement.js
import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/studentService';
import { getClasses } from '../services/classService';
import CSVImport from './CSVImport';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', studentId: '', grade: '', classId: '', pin: '' });
    const [editingStudent, setEditingStudent] = useState(null);
    const [showCSVImport, setShowCSVImport] = useState(false);

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        try {
            const fetchedStudents = await getStudents();
            setStudents(fetchedStudents);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const fetchedClasses = await getClasses();
            setClasses(fetchedClasses);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await createStudent(newStudent);
            setNewStudent({ firstName: '', lastName: '', studentId: '', grade: '', classId: '', pin: '' });
            fetchStudents();
        } catch (error) {
            console.error('Failed to create student:', error);
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            await updateStudent(editingStudent._id, editingStudent);
            setEditingStudent(null);
            fetchStudents();
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await deleteStudent(studentId);
            fetchStudents();
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    const handleImportComplete = () => {
        fetchStudents();
        setShowCSVImport(false);
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Student Management</h2>
            <button
                onClick={() => setShowCSVImport(!showCSVImport)}
                className="bg-teal-700 text-white p-2 rounded mb-4"
            >
                {showCSVImport ? 'Hide CSV Import' : 'Show CSV Import'}
            </button>

            {showCSVImport && (
                <CSVImport onImportComplete={handleImportComplete} />
            )}

            {/* Create Student Form */}
            <form onSubmit={handleCreateStudent} className="mb-8">
                <input
                    type="text"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    placeholder="First Name"
                    className="mr-2 p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="mr-2 p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    placeholder="Student ID"
                    className="mr-2 p-2 border rounded"
                    required
                />
                <input
                    type="number"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    placeholder="Grade"
                    className="mr-2 p-2 border rounded"
                    required
                />
                <select
                    value={newStudent.classId}
                    onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                    className="mr-2 p-2 border rounded"
                    required
                >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                    ))}
                </select>
                <input
                    type="text"
                    value={newStudent.pin}
                    onChange={(e) => setNewStudent({ ...newStudent, pin: e.target.value })}
                    placeholder="PIN"
                    className="mr-2 p-2 border rounded"
                    required
                />
                <button type="submit" className="bg-teal-700 text-white p-2 rounded">Create Student</button>
            </form>

            {/* Student List */}
            <ul>
                {students.map((student) => (
                    <li key={student._id} className="mb-4 p-4 border rounded">
                        {editingStudent && editingStudent._id === student._id ? (
                            <form onSubmit={handleUpdateStudent}>
                                <input
                                    type="text"
                                    value={editingStudent.firstName}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                                    className="mr-2 p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    value={editingStudent.lastName}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                                    className="mr-2 p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    value={editingStudent.studentId}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, studentId: e.target.value })}
                                    className="mr-2 p-2 border rounded"
                                    required
                                />
                                <input
                                    type="number"
                                    value={editingStudent.grade}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                                    className="mr-2 p-2 border rounded"
                                    required
                                />
                                <select
                                    value={editingStudent.classId}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, classId: e.target.value })}
                                    className="mr-2 p-2 border rounded"
                                    required
                                >
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={editingStudent.pin}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, pin: e.target.value })}
                                    className="mr-2 p-2 border rounded"
                                    required
                                />
                                <button type="submit" className="bg-green-500 text-white p-2 rounded mr-2">Save</button>
                                <button onClick={() => setEditingStudent(null)} className="bg-gray-500 text-white p-2 rounded">Cancel</button>
                            </form>
                        ) : (
                            <>
                                <span>{student.firstName} {student.lastName} - ID: {student.studentId}, Grade: {student.grade}</span>
                                <button onClick={() => setEditingStudent(student)} className="ml-2 bg-yellow-500 text-white p-2 rounded">Edit</button>
                                <button onClick={() => handleDeleteStudent(student._id)} className="ml-2 bg-red-500 text-white p-2 rounded">Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentManagement;