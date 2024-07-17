import React, { useState, useEffect } from 'react';
import { getStudentsByClass, updateStudent, deleteStudent } from '../../services/studentService';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Swal from 'sweetalert2';
import StudentSortHeader from './StudentSortHeader';
import StudentDetails from '../slideout/StudentDetails';
import StudentEdit from '../slideout/StudentEdit';
import SlideoutParent from '../slideout/SlideoutParent';

const StudentTable = ({ students, setStudents, classes }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [sortField, setSortField] = useState('firstName');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedClassForView, setSelectedClassForView] = useState({ _id: 'all', name: 'All Classes' });
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', error: false, undo: false });
    const [dialog, setDialog] = useState({ open: false, title: '', content: '', onConfirm: () => { } });

    useEffect(() => {
        fetchStudents();
    }, [selectedClassForView]);

    const fetchStudents = async () => {
        try {
            const students = await getStudentsByClass(selectedClassForView._id);
            setStudents(students);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsSlideoutOpen(true);
        setIsEditing(false);
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setIsEditing(true);
        setIsSlideoutOpen(true);
    };

    const handleSaveStudent = async (updatedStudent) => {
        try {
            const savedStudent = await updateStudent(updatedStudent._id, updatedStudent);
            setStudents(students.map(s => s._id === savedStudent._id ? savedStudent : s));
            setSelectedStudent(savedStudent);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await deleteStudent(studentId);
            setStudents(students.filter(s => s._id !== studentId));
            setIsSlideoutOpen(false);
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    const handleCloseSlideout = () => {
        setIsSlideoutOpen(false);
        setIsEditing(false);
    };

    const slideoutContent = selectedStudent && (
        isEditing ? (
            <StudentEdit
                student={selectedStudent}
                onSave={handleSaveStudent}
                onClose={handleCloseSlideout}
                onView={() => setIsEditing(false)}
                onDelete={handleDeleteStudent}
                classes={classes}
            />
        ) : (
            <StudentDetails
                student={selectedStudent}
                onEdit={() => handleEditStudent(selectedStudent)}
                onClose={handleCloseSlideout}
            />
        )
    );

    const handleSortChange = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const handleClassChangeForView = (e) => {
        const selectedClassId = e.target.value;
        const selectedClass = selectedClassId === 'all' ? { _id: 'all', name: 'All Classes' } : classes.find(cls => cls._id === selectedClassId);
        setSelectedClassForView(selectedClass);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredStudents = students.filter(student => {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        const className = student.class?.name ? student.class.name.toLowerCase() : '';
        const grade = student.grade?.toString() || '';

        return fullName.includes(searchQuery.toLowerCase()) ||
            grade.includes(searchQuery.toLowerCase()) ||
            className.includes(searchQuery.toLowerCase());
    });


    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'name') {
            aValue = `${a.firstName || ''} ${a.lastName || ''}`;
            bValue = `${b.firstName || ''} ${b.lastName || ''}`;
        } else if (sortField === 'class') {
            aValue = a.class ? a.class.name : '';
            bValue = b.class ? b.class.name : '';
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div>
            <div className="mt-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h2 className="text-base font-semibold leading-6 text-gray-900">
                            View Students in
                            <select
                                value={selectedClassForView._id}
                                onChange={handleClassChangeForView}
                                className="ml-2 rounded-md border-gray-300 text-base leading-6"
                            >
                                <option value="all">All Classes</option>
                                {classes.map(cls => (
                                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                                ))}
                            </select>
                        </h2>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                placeholder="Search students"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </div>
                {selectedClassForView && (
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <StudentSortHeader
                                                field="name"
                                                handleSortChange={handleSortChange}
                                                sortField={sortField}
                                                sortOrder={sortOrder}
                                                label="Name"
                                            />
                                            <StudentSortHeader
                                                field="grade"
                                                handleSortChange={handleSortChange}
                                                sortField={sortField}
                                                sortOrder={sortOrder}
                                                label="Grade"
                                            />
                                            <StudentSortHeader
                                                field="class"
                                                handleSortChange={handleSortChange}
                                                sortField={sortField}
                                                sortOrder={sortOrder}
                                                label="Class"
                                            />
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
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                    {student.class ? student.class.name : 'N/A'}
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
            <SlideoutParent
                isOpen={isSlideoutOpen}
                onClose={handleCloseSlideout}
                title={isEditing ? 'Edit Student' : 'Student Details'}
                content={slideoutContent}
                notification={notification}
                setNotification={setNotification}
                dialog={dialog}
                setDialog={setDialog}
            >
                {slideoutContent}
            </SlideoutParent>
        </div>
    );
};

export default StudentTable;
