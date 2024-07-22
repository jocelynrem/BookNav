import React, { useState, useEffect } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { getClasses } from '../../services/classService';
import { getStudentsByClass } from '../../services/studentService';
import { checkBookStatus, checkoutBook, returnBook } from '../../services/checkoutService';
import SlideoutParent from '../slideout/SlideoutParent';
import StudentDetails from '../slideout/StudentDetails';
import ActionPanelModal from './ActionPanelModal';
import Swal from 'sweetalert2';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const getColorForClass = (className) => {
    const colors = [
        'bg-pink-600', 'bg-purple-600', 'bg-yellow-500', 'bg-green-500',
        'bg-blue-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'
    ];
    const hash = className.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
};

const TeacherCheckout = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);
    const [bookStatus, setBookStatus] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const fetchedClasses = await getClasses();
                setClasses(fetchedClasses);
            } catch (error) {
                console.error('Error fetching classes:', error);
                Swal.fire('Error', 'Failed to fetch classes. Please try again.', 'error');
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            const fetchStudents = async () => {
                try {
                    const fetchedStudents = await getStudentsByClass(selectedClass);
                    setStudents(fetchedStudents);
                } catch (error) {
                    console.error('Error fetching students:', error);
                    Swal.fire('Error', 'Failed to fetch students. Please try again.', 'error');
                }
            };
            fetchStudents();
        }
    }, [selectedClass]);

    const handleClassSelect = (e) => {
        setSelectedClass(e.target.value);
        setSelectedStudent(null);
        setIsActionPanelOpen(false);
    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setIsActionPanelOpen(true);
    };

    const handleScan = async (scannedISBN) => {
        try {
            const status = await checkBookStatus(scannedISBN, selectedStudent._id);
            setBookStatus(status);
        } catch (error) {
            console.error('Error checking book status:', error);
            Swal.fire('Error', 'Failed to check book status. Please try again.', 'error');
        }
    };

    const handleConfirmAction = async () => {
        try {
            if (bookStatus.action === 'checkout') {
                await checkoutBook(bookStatus.isbn, selectedStudent._id);
                Swal.fire('Success', `${bookStatus.title} has been checked out to ${selectedStudent.firstName} ${selectedStudent.lastName}.`, 'success');
            } else {
                await returnBook(bookStatus.isbn);
                Swal.fire('Success', `${bookStatus.title} has been returned.`, 'success');
            }
            setIsActionPanelOpen(false);
            setBookStatus(null);
        } catch (error) {
            console.error('Error performing action:', error);
            Swal.fire('Error', 'Failed to perform action. Please try again.', 'error');
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold mb-6">Teacher Checkout</h2>

            {/* Class selection dropdown */}
            <div className="mb-8">
                <label htmlFor="class-select" className="block text-sm font-medium text-gray-700">
                    Select a Class
                </label>
                <select
                    id="class-select"
                    value={selectedClass}
                    onChange={handleClassSelect}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="">Select a class</option>
                    {classes.map((classItem) => (
                        <option key={classItem._id} value={classItem._id}>
                            {classItem.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Student selection grid */}
            {selectedClass && (
                <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Select a Student</h3>
                    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {students.map((student) => (
                            <li
                                key={student._id}
                                className={classNames(
                                    "col-span-1 flex rounded-md shadow-sm cursor-pointer",
                                    selectedStudent && selectedStudent._id === student._id ? "ring-2 ring-pink-500" : ""
                                )}
                                onClick={() => handleStudentSelect(student)}
                            >
                                <div
                                    className={classNames(
                                        getColorForClass(classes.find(c => c._id === selectedClass).name),
                                        'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
                                    )}
                                >
                                    {getInitials(student.firstName, student.lastName)}
                                </div>
                                <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                                    <div className="flex-1 truncate px-4 py-2 text-sm">
                                        <p className="font-medium text-gray-900 hover:text-gray-600">
                                            {student.firstName} {student.lastName}
                                        </p>
                                        <p className="text-gray-500">{student.grade}</p>
                                    </div>
                                    <div className="flex-shrink-0 pr-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsSlideoutOpen(true);
                                                setSelectedStudent(student);
                                            }}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                                        >
                                            <span className="sr-only">Open options</span>
                                            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Panel Modal */}
            <ActionPanelModal
                isOpen={isActionPanelOpen}
                onClose={() => setIsActionPanelOpen(false)}
                student={selectedStudent}
                onScan={handleScan}
                bookStatus={bookStatus}
                onConfirmAction={handleConfirmAction}
            />

            {/* Student Details Slideout */}
            <SlideoutParent
                isOpen={isSlideoutOpen}
                onClose={() => setIsSlideoutOpen(false)}
                title="Student Details"
            >
                {selectedStudent && (
                    <StudentDetails
                        student={selectedStudent}
                        onClose={() => setIsSlideoutOpen(false)}
                    />
                )}
            </SlideoutParent>
        </div>
    );
};

export default TeacherCheckout;