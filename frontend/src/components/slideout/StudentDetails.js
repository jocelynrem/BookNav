import React, { useEffect, useState } from 'react';
import { ArrowRightIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { getStudentReadingHistory } from '../../services/studentService';

const StudentDetails = ({ student, onEdit, classes = [], onClose }) => {
    const [currentStudent, setCurrentStudent] = useState(student);
    const [readingHistory, setReadingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setCurrentStudent(student);
        fetchReadingHistory();
    }, [student]);

    const fetchReadingHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const history = await getStudentReadingHistory(student._id);
            setReadingHistory(history);
        } catch (error) {
            console.error('Error fetching reading history:', error);
            setError('Failed to load reading history. Please try again.');
        } finally {
            setIsLoading(false);
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
                                            <p className="text-sm font-medium text-gray-900">{record.entry}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
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