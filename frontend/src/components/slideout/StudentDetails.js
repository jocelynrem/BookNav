import React, { useEffect, useState } from 'react';
import { ArrowRightIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { getDetailedReadingHistory } from '../../services/checkoutService';
import { getCurrentCheckouts, returnBook } from '../../services/checkoutService';
import Swal from 'sweetalert2';

const StudentDetails = ({ student, onEdit, classes = [], onClose }) => {
    const [currentStudent, setCurrentStudent] = useState(student);
    const [readingHistory, setReadingHistory] = useState([]);
    const [currentCheckouts, setCurrentCheckouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setCurrentStudent(student);
        fetchReadingHistory();
        fetchCurrentCheckouts();
    }, [student]);

    const fetchReadingHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const history = await getDetailedReadingHistory(student._id);
            setReadingHistory(history);
        } catch (error) {
            console.error('Error fetching reading history:', error);
            setError('Failed to load reading history. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrentCheckouts = async () => {
        try {
            const checkouts = await getCurrentCheckouts(student._id);
            setCurrentCheckouts(checkouts);
        } catch (error) {
            console.error('Error fetching current checkouts:', error);
            setError('Failed to load current checkouts. Please try again.');
        }
    };

    const handleReturn = async (checkoutId) => {
        try {
            await returnBook(checkoutId);
            Swal.fire('Success', 'Book returned successfully', 'success');
            fetchCurrentCheckouts(); // Refresh the list of current checkouts
            fetchReadingHistory(); // Refresh the reading history
        } catch (error) {
            console.error('Error returning book:', error);
            Swal.fire('Error', 'Failed to return book. Please try again.', 'error');
        }
    };

    const getClassName = (classData) => {
        if (!classData) return 'N/A';
        if (typeof classData === 'string') {
            if (classes.length === 0) return `Class ID: ${classData}`;
            const fullClass = classes.find(cls => cls._id === classData);
            return fullClass ? fullClass.name : `Class ID: ${classData}`;
        }
        return classData.name || `Class ID: ${classData._id}`;
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="space-y-6 pb-16">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{currentStudent.firstName} {currentStudent.lastName}</h2>
                <button
                    type="button"
                    className="flex items-center text-teal-700 hover:text-teal-900"
                    onClick={onEdit}
                >
                    Edit student
                    <ArrowRightIcon className="ml-1 h-5 w-5" />
                </button>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
                <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                    <div className="flex justify-between py-3 text-sm">
                        <dt className="text-gray-500 font-medium">Grade</dt>
                        <dd className="text-gray-900">{currentStudent.grade || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm">
                        <dt className="text-gray-500 font-medium">Class</dt>
                        <dd className="text-gray-900">{getClassName(currentStudent.class)}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm">
                        <dt className="text-gray-500 font-medium">Reading Level</dt>
                        <dd className="text-gray-900">{currentStudent.readingLevel || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm">
                        <dt className="text-gray-500 font-medium">Pin</dt>
                        <dd className="text-gray-900">{currentStudent.pin || 'N/A'}</dd>
                    </div>
                </dl>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900">Current Checkouts</h3>
                {currentCheckouts.length > 0 ? (
                    <ul className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                        {currentCheckouts.map((checkout) => (
                            <li key={checkout._id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{checkout.bookCopy.book.title}</p>
                                    <p className="text-sm text-gray-500">Checked out on: {formatDate(checkout.checkoutDate)}</p>
                                </div>
                                <button
                                    onClick={() => handleReturn(checkout._id)}
                                    className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                >
                                    Return
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 mt-2">No books currently checked out.</p>
                )}
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900">Reading History</h3>
                {isLoading ? (
                    <p className="text-gray-500 mt-2">Loading reading history...</p>
                ) : error ? (
                    <p className="text-red-500 mt-2">{error}</p>
                ) : readingHistory.length > 0 ? (
                    <ul className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                        {readingHistory.map((record, index) => (
                            <li key={index} className="py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <BookOpenIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{record.bookTitle}</p>
                                            <p className="text-sm text-gray-500">Returned on: {formatDate(record.returnDate)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            Kept for {record.daysKept} days
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 mt-2">No reading history available.</p>
                )}
            </div>
        </div>
    );
};

export default StudentDetails;