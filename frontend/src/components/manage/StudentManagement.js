import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';
import { createStudent, updateStudent, deleteStudent } from '../../services/studentService';
import SlideoutParent from '../slideout/SlideoutParent';

const StudentManagement = ({ students, setStudents, selectedClass }) => {
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        if (!selectedClass) return;
        try {
            const newStudent = await createStudent({ name: newStudentName, classId: selectedClass._id });
            setStudents([...students, newStudent]);
            setNewStudentName('');
            setShowAddStudent(false);
        } catch (error) {
            console.error('Failed to create student:', error);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsSlideoutOpen(true);
        setIsEditing(false);
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setIsSlideoutOpen(true);
        setIsEditing(true);
    };

    const handleSaveStudent = async (updatedStudent) => {
        try {
            await updateStudent(updatedStudent._id, updatedStudent);
            setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));
            setIsSlideoutOpen(false);
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await deleteStudent(studentId);
            setStudents(students.filter(s => s._id !== studentId));
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    const handleSortChange = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const sortedStudents = [...students].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="mt-8">
            <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex items-center justify-between">
                    <span className={`bg-white pr-3 text-base leading-6 ${!selectedClass ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}>
                        {!selectedClass ? "Select a class before adding students" : "Student Management"}
                    </span>
                    <button
                        type="button"
                        className={`inline-flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm ring-inset ${!selectedClass ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'}`}
                        onClick={() => setShowAddStudent(!showAddStudent)}
                        disabled={!selectedClass}
                    >
                        <PlusIcon aria-hidden="true" className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400" />
                        {showAddStudent ? 'Hide' : 'Add Student'}
                    </button>
                </div>
            </div>

            {showAddStudent && selectedClass && (
                <div className="mt-8 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Add a new student</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Add a new student to the selected class.</p>
                        </div>
                        <form onSubmit={handleCreateStudent} className="mt-5 sm:flex sm:items-center">
                            <div className="w-full sm:max-w-xs">
                                <label htmlFor="studentName" className="sr-only">
                                    Student name
                                </label>
                                <input
                                    type="text"
                                    name="studentName"
                                    id="studentName"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                    placeholder="Enter student name"
                                    value={newStudentName}
                                    onChange={(e) => setNewStudentName(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:ml-3 sm:mt-0 sm:w-auto"
                            >
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {selectedClass && (
                <div className="mt-8">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h2 className="text-base font-semibold leading-6 text-gray-900">Students in {selectedClass.name}</h2>
                        </div>
                    </div>
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                            >
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                            >
                                                Grade
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {sortedStudents.map((student) => (
                                            <tr key={student._id}>
                                                <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                    <div className="flex items-center">
                                                        <div className="ml-4">
                                                            <div
                                                                className="font-medium text-teal-900 cursor-pointer hover:text-teal-700"
                                                                onClick={() => handleStudentClick(student)}
                                                            >
                                                                {student.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                    {student.grade}
                                                </td>
                                                <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                    <button
                                                        onClick={() => handleEditStudent(student)}
                                                        className="text-teal-900 hover:text-teal-800"
                                                    >
                                                        Edit<span className="sr-only">, {student.name}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedStudent && (
                <SlideoutParent
                    isOpen={isSlideoutOpen}
                    onClose={() => setIsSlideoutOpen(false)}
                    student={selectedStudent}
                    onSave={handleSaveStudent}
                    onDelete={handleDeleteStudent}
                    isEditing={isEditing}
                />
            )}
        </div>
    );
};

export default StudentManagement;
