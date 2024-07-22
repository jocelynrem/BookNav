import React, { useState, useEffect } from 'react';
import { QrCodeIcon, XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import ISBNScanner from './ISBNScanner';
import { getStudentCheckouts, returnBook, checkoutBook, searchBooks } from '../../services/checkoutService';

const ActionPanelModal = ({ isOpen, onClose, student, onScan, bookStatus, onConfirmAction }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [checkedOutBooks, setCheckedOutBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen && student) {
            fetchCheckedOutBooks();
        }
    }, [isOpen, student]);

    const fetchCheckedOutBooks = async () => {
        try {
            const books = await getStudentCheckouts(student._id);
            setCheckedOutBooks(books);
        } catch (error) {
            console.error('Failed to fetch checked out books:', error);
        }
    };

    const handleReturn = async (bookId) => {
        try {
            await returnBook(bookId);
            fetchCheckedOutBooks(); // Refresh the list after returning
        } catch (error) {
            console.error('Failed to return book:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchBooks(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Failed to search books:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCheckout = async (bookId) => {
        try {
            await checkoutBook(bookId, student._id);
            fetchCheckedOutBooks(); // Refresh the list after checkout
            setSearchResults([]); // Clear search results
            setSearchQuery(''); // Clear search query
        } catch (error) {
            console.error('Failed to check out book:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {student.firstName} {student.lastName}
                                </h3>

                                {/* Checked Out Books Section */}
                                <div className="mt-4">
                                    <h4 className="text-md font-medium text-gray-700">Checked Out Books</h4>
                                    {checkedOutBooks.length === 0 ? (
                                        <p className="text-sm text-gray-500">No books currently checked out.</p>
                                    ) : (
                                        <ul className="mt-2 divide-y divide-gray-200">
                                            {checkedOutBooks.map((book) => (
                                                <li key={book._id} className="py-2 flex justify-between items-center">
                                                    <span className="text-sm text-gray-900">{book.title}</span>
                                                    <button
                                                        onClick={() => handleReturn(book._id)}
                                                        className="text-sm text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Return
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Book Search Section */}
                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-700">Check Out a Book</h4>
                                    <div className="mt-2 flex">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by title or author"
                                            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Search
                                        </button>
                                    </div>
                                    {isSearching ? (
                                        <p className="mt-2 text-sm text-gray-500">Searching...</p>
                                    ) : searchResults.length > 0 ? (
                                        <ul className="mt-2 divide-y divide-gray-200">
                                            {searchResults.map((book) => (
                                                <li key={book._id} className="py-2 flex justify-between items-center">
                                                    <span className="text-sm text-gray-900">{book.title}</span>
                                                    <button
                                                        onClick={() => handleCheckout(book._id)}
                                                        className="text-sm text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Check Out
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>

                                {/* ISBN Scanning Section */}
                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-700">Scan ISBN to Check Out</h4>
                                    <div className="mt-2">
                                        {isScanning ? (
                                            <>
                                                <ISBNScanner onScan={onScan} />
                                                <button
                                                    onClick={() => setIsScanning(false)}
                                                    className="mt-2 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    Stop Scanning
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setIsScanning(true)}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <QrCodeIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                                                Start Scanning
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {bookStatus && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">
                                            {bookStatus.action === 'checkout' ? 'Ready to check out:' : 'Ready to return:'}
                                        </p>
                                        <p className="mt-1 text-lg font-medium text-gray-900">{bookStatus.title}</p>
                                        <button
                                            onClick={onConfirmAction}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            {bookStatus.action === 'checkout' ? 'Confirm Checkout' : 'Confirm Return'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionPanelModal;