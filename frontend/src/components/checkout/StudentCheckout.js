import React, { useState, useEffect } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { getStudents } from '../../services/studentService';
import { checkoutBook, returnBook } from '../../services/checkoutService';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

// Generate a color based on the class name
const getColorForClass = (className) => {
    const colors = [
        'bg-pink-600', 'bg-purple-600', 'bg-yellow-500', 'bg-green-500',
        'bg-blue-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'
    ];
    const hash = className.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
};

const StudentCheckout = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isbn, setIsbn] = useState('');
    const [action, setAction] = useState('checkout');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const fetchedStudents = await getStudents();
                setStudents(fetchedStudents);
            } catch (error) {
                console.error('Error fetching students:', error);
                setMessage('Failed to fetch students. Please try again.');
            }
        };
        fetchStudents();
    }, []);

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setMessage('');
    };

    const handleActionSelect = (selectedAction) => {
        setAction(selectedAction);
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!selectedStudent) {
            setMessage('Please select a student first.');
            return;
        }

        try {
            if (action === 'checkout') {
                await checkoutBook(isbn, selectedStudent._id);
                setMessage(`Book checked out successfully to ${selectedStudent.firstName} ${selectedStudent.lastName}`);
            } else {
                await returnBook(isbn);
                setMessage('Book returned successfully');
            }
            setIsbn('');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold mb-6">Student Checkout</h2>
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
                                getColorForClass(student.class ? student.class.name : 'No Class'),
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
                                <p className="text-gray-500">{student.class ? student.class.name : 'No Class'}</p>
                            </div>
                            <div className="flex-shrink-0 pr-2">
                                <button
                                    type="button"
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

            {selectedStudent && (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                            ISBN
                        </label>
                        <input
                            type="text"
                            id="isbn"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Action
                        </label>
                        <div className="mt-1 space-x-4">
                            <button
                                type="button"
                                onClick={() => handleActionSelect('checkout')}
                                className={classNames(
                                    "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm",
                                    action === 'checkout'
                                        ? "text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                        : "text-pink-700 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                )}
                            >
                                Checkout
                            </button>
                            <button
                                type="button"
                                onClick={() => handleActionSelect('return')}
                                className={classNames(
                                    "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm",
                                    action === 'return'
                                        ? "text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                        : "text-pink-700 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                )}
                            >
                                Return
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                        Submit
                    </button>
                </form>
            )}

            {message && (
                <div className="mt-4 p-4 rounded-md bg-blue-50 text-blue-700">
                    {message}
                </div>
            )}
        </div>
    );
};

export default StudentCheckout;