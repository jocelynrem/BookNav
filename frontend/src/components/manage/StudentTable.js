import React, { useState } from 'react';
import { updateStudent, deleteStudent } from '../../services/studentService';
import SlideoutParent from '../slideout/SlideoutParent';

const StudentTable = ({ students, setStudents, selectedClass, setSelectedClass, classes }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [sortField, setSortField] = useState('firstName');
    const [sortOrder, setSortOrder] = useState('asc');

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

    const handleClassChange = (e) => {
        const selectedClassId = e.target.value;
        const selectedClass = selectedClassId === 'all' ? { _id: 'all', name: 'All Classes' } : classes.find(cls => cls._id === selectedClassId);
        setSelectedClass(selectedClass);
    };

    return (
        <div>
            <div className="mt-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h2 className="text-base font-semibold leading-6 text-gray-900">
                            View Students in
                            {Array.isArray(classes) && classes.length > 1 ? (
                                <select
                                    value={selectedClass?._id || ''}
                                    onChange={handleClassChange}
                                    className="ml-2 rounded-md border-gray-300 text-base leading-6"
                                >
                                    <option value="" disabled>Select class</option>
                                    <option value="all">All Classes</option>
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <span> {selectedClass?.name}</span>
                            )}
                        </h2>
                    </div>
                </div>
                {selectedClass && (
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                                onClick={() => handleSortChange('firstName')}
                                            >
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                onClick={() => handleSortChange('grade')}
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
                                                                {student.firstName} {student.lastName}
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
                                                        Edit<span className="sr-only">, {student.firstName} {student.lastName}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

export default StudentTable;
