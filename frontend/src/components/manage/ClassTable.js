import React, { useState, useEffect } from 'react';
import ClassEdit from '../slideout/ClassEdit';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { getStudents } from '../../services/studentService';

const ClassTable = ({ classes, setClasses, handleEditClass, handleDeleteClass }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [studentCounts, setStudentCounts] = useState({});

    useEffect(() => {
        const fetchStudentCounts = async () => {
            try {
                const counts = await countStudentsPerClass();
                setStudentCounts(counts);
            } catch (error) {
                console.error('Failed to fetch student counts:', error);
            }
        };

        fetchStudentCounts();
    }, [classes]);

    const countStudentsPerClass = async () => {
        try {
            const students = await getStudents();
            const studentCounts = students.reduce((acc, student) => {
                const classId = student.class ? student.class._id : undefined;
                if (!acc[classId]) {
                    acc[classId] = 0;
                }
                acc[classId]++;
                return acc;
            }, {});
            return studentCounts;
        } catch (error) {
            console.error('Failed to count students per class:', error);
            throw error;
        }
    };


    const handleEditClick = (classItem) => {
        setSelectedClass(classItem);
        setIsSlideoutOpen(true);
    };

    const handleSortChange = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const sortedClasses = [...classes].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const gradeName = (grade) => {
        const gradeMap = {
            'K': 'Kindergarten',
            '1': '1st Grade',
            '2': '2nd Grade',
            '3': '3rd Grade',
            '4': '4th Grade',
            '5': '5th Grade',
            '6': '6th Grade',
            '7': '7th Grade',
            '8': '8th Grade',
            '9': '9th Grade',
            '10': '10th Grade',
            '11': '11th Grade',
            '12': '12th Grade',
            'O': 'Other',
        };
        if (!gradeMap[grade]) {
            console.warn(`Unexpected grade value: ${grade}`);
            return 'Undefined Grade';
        }
        return gradeMap[grade];
    };

    const totalPages = Math.ceil(sortedClasses.length / itemsPerPage);
    const currentClasses = sortedClasses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 cursor-pointer"
                                        onClick={() => handleSortChange('name')}
                                    >
                                        Class Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => handleSortChange('grade')}
                                    >
                                        Grade
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => handleSortChange('studentCount')}
                                    >
                                        Students
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentClasses.map((classItem) => (
                                    <tr key={classItem._id}>
                                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                            <div className="flex items-center">
                                                <div className="font-medium text-gray-900">{classItem.name}</div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                            {gradeName(classItem.grade)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                            {studentCounts[classItem._id] || 0}
                                        </td>
                                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                            <button
                                                onClick={() => handleEditClick(classItem)}
                                                className="text-teal-600 hover:text-teal-900"
                                            >
                                                Edit<span className="sr-only">, {classItem.name}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedClasses.length > itemsPerPage && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={sortedClasses.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            {selectedClass && (
                <ClassEdit
                    isOpen={isSlideoutOpen}
                    onClose={() => setIsSlideoutOpen(false)}
                    classItem={selectedClass}
                    onSave={handleEditClass}
                    onDelete={handleDeleteClass}
                />
            )}
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

export default ClassTable;
