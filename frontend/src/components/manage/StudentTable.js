import React, { useState, useEffect } from 'react';
import { getStudentsByClass, updateStudent, deleteStudent } from '../../services/studentService';
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, [selectedClassForView]);

    useEffect(() => {
        if (students) {
            // Force re-render to ensure the latest props are reflected in the component state
            setSelectedStudent(null);
            setIsSlideoutOpen(false);
        }
    }, [students]);

    const fetchStudents = async () => {
        try {
            const fetchedStudents = await getStudentsByClass(selectedClassForView._id);
            setStudents(fetchedStudents);
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
            const fullClass = classes.find(cls => cls._id === savedStudent.class);
            const updatedStudentWithFullClass = {
                ...savedStudent,
                class: fullClass || { _id: savedStudent.class, name: 'Unknown Class' }
            };

            setStudents(students.map(s => s._id === updatedStudentWithFullClass._id ? updatedStudentWithFullClass : s));
            setSelectedStudent(updatedStudentWithFullClass);
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

    const handleDeleteSelectedStudents = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete the selected students and all of their data? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all(selectedStudents.map(studentId => deleteStudent(studentId)));
                    setStudents(students.filter(s => !selectedStudents.includes(s._id)));
                    setSelectedStudents([]);
                    Swal.fire('Deleted!', 'The selected students have been deleted.', 'success');
                } catch (error) {
                    console.error('Failed to delete students:', error);
                }
            }
        });
    };

    const handleCloseSlideout = () => {
        setIsSlideoutOpen(false);
        setIsEditing(false);
    };

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

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prevSelected => prevSelected.includes(studentId) ? prevSelected.filter(id => id !== studentId) : [...prevSelected, studentId]);
    };

    const handleSelectAllStudents = () => {
        if (selectedStudents.length === currentStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(currentStudents.map(student => student._id));
        }
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

    const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
    const currentStudents = sortedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                classes={classes}
            />
        )
    );

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
                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
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
                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={handleDeleteSelectedStudents}
                                        disabled={selectedStudents.length === 0}
                                        className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Delete Selected
                                    </button>
                                </div>
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="relative py-3.5 pl-4 pr-3 sm:pl-6 sm:pr-6">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-pink-600 shadow-sm focus:ring-pink-500"
                                                        checked={selectedStudents.length === currentStudents.length}
                                                        onChange={handleSelectAllStudents}
                                                    />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                <StudentSortHeader
                                                    field="name"
                                                    handleSortChange={handleSortChange}
                                                    sortField={sortField}
                                                    sortOrder={sortOrder}
                                                    label="Name"
                                                />
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                <StudentSortHeader
                                                    field="grade"
                                                    handleSortChange={handleSortChange}
                                                    sortField={sortField}
                                                    sortOrder={sortOrder}
                                                    label="Grade"
                                                />
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                <StudentSortHeader
                                                    field="class"
                                                    handleSortChange={handleSortChange}
                                                    sortField={sortField}
                                                    sortOrder={sortOrder}
                                                    label="Class"
                                                />
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pl-6 sm:pr-6">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {currentStudents.map((student) => (
                                            <tr key={student._id}>
                                                <td className="relative py-5 pl-4 pr-3 sm:pl-6 sm:pr-6">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-pink-600 shadow-sm focus:ring-pink-500"
                                                            checked={selectedStudents.includes(student._id)}
                                                            onChange={() => handleSelectStudent(student._id)}
                                                        />
                                                    </div>
                                                </td>
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
                                {sortedStudents.length > itemsPerPage && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalItems={sortedStudents.length}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <SlideoutParent
                isOpen={isSlideoutOpen}
                onClose={handleCloseSlideout}
                title={isEditing ? 'Edit Student' : 'Student Details'}
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

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                        <span className="font-medium">{totalItems}</span> results
                    </p>
                </div>
                <div>
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                        {[...Array(totalPages).keys()].map(page => (
                            <button
                                key={page + 1}
                                onClick={() => onPageChange(page + 1)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page + 1 ? 'bg-pink-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                            >
                                {page + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default StudentTable;
