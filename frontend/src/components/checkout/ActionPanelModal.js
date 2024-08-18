import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ISBNScanner from './ISBNScanner';
import { getCurrentCheckouts, returnBook, checkoutBook, searchBooks } from '../../services/checkoutService';
import Swal from 'sweetalert2';

const ActionPanelModal = ({ isOpen, onClose, student, bookStatus, onConfirmAction }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [checkedOutBooks, setCheckedOutBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
    const modalRef = useRef();
    const isProcessingRef = useRef(false);

    useEffect(() => {
        if (isOpen && student) {
            fetchCheckedOutBooks();
        }
    }, [isOpen, student]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleClose = () => {
        setIsScanning(false);
        onClose();
    };

    const fetchCheckedOutBooks = async () => {
        try {
            const books = await getCurrentCheckouts(student._id);
            setCheckedOutBooks(books);
        } catch (error) {
            console.error('Failed to fetch checked out books:', error);
        }
    };

    const handleReturn = async (checkoutRecordId) => {
        try {
            if (isProcessing) return;
            setIsProcessing(true);

            const updatedCheckout = await returnBook(checkoutRecordId);
            Swal.fire('Success', 'Book returned successfully', 'success');
            await fetchCheckedOutBooks();
            onConfirmAction();
        } catch (error) {
            console.error('Failed to return book:', error);
            Swal.fire('Error', 'Failed to return book. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSearchActionPanel = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchBooks(searchQuery);

            if (results.length === 0) {
                console.warn('No books found matching your search.'); // Warn if no results
            } else {
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Failed to search books:', error);
            Swal.fire('Error', 'Failed to search books. Please try again.', 'error');
        } finally {
            setIsSearching(false);
        }
    };


    const handleCheckout = async (bookId) => {
        try {
            if (isProcessing || isCheckoutInProgress) return;
            setIsCheckoutInProgress(true);

            const checkoutResult = await checkoutBook(bookId, student._id);
            await fetchCheckedOutBooks();

            Swal.fire({
                title: 'Success',
                html: `
                    <p>${checkoutResult.book?.title || 'Unknown Title'} has been checked out successfully.</p>
                    <p>Due Date: <strong>${new Date(checkoutResult.dueDate).toLocaleDateString()}</strong></p>
                `,
                icon: 'success'
            });

            setSearchResults(prevResults =>
                prevResults.map(book =>
                    book._id === bookId
                        ? { ...book, copiesAvailable: book.copiesAvailable - 1 }
                        : book
                )
            );
            onConfirmAction();
        } catch (error) {
            console.error('Failed to check out book:', error);
            Swal.fire('Error', 'Failed to check out book. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
            setIsCheckoutInProgress(false);
        }
    };

    const handleScan = useCallback(
        debounce(async (scannedCode) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;
            setIsScanning(false);

            try {
                const results = await searchBooks(scannedCode);

                if (results.length === 0) {
                    Swal.fire('Error', 'Book not found in the library system.', 'error');
                } else {
                    const availableBook = results[0]; // Assuming the first result is the desired book

                    if (availableBook.copiesAvailable > 0) {
                        setSearchResults(results);
                        Swal.fire({
                            title: 'Book Found',
                            text: `Do you want to check out "${availableBook.title}"?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, check out',
                            cancelButtonText: 'No, cancel'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                handleCheckout(availableBook._id);
                            }
                        });
                    } else {
                        Swal.fire('Error', 'No copies available for checkout.', 'error');
                    }
                }
            } catch (error) {
                console.error('Error during book search:', error);
                Swal.fire('Error', 'An error occurred while searching for the book. Please try again.', 'error');
            } finally {
                isProcessingRef.current = false;
            }
        }, 500),
        []
    );


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchActionPanel();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4 sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div
                ref={modalRef}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                    <button
                        type="button"
                        className="absolute top-0 right-0 mt-3 mr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={handleClose}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
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
                                        {checkedOutBooks.map((checkout) => (
                                            <li key={checkout._id} className="py-2 flex justify-between items-center">
                                                <span className="text-sm text-gray-900">
                                                    {checkout.book?.title || 'Unknown Title'}
                                                </span>
                                                <button
                                                    onClick={() => handleReturn(checkout._id)}
                                                    className="text-sm text-pink-600 hover:text-pink-900"
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
                                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button
                                        onClick={handleSearchActionPanel}
                                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
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
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">{book.title}</span>
                                                    <p className="text-xs text-gray-500">by {book.author}</p>
                                                </div>
                                                {book.copiesAvailable > 0 ? (
                                                    <button
                                                        onClick={() => handleCheckout(book._id)}
                                                        className="text-sm text-pink-600 hover:text-pink-900"
                                                        disabled={isProcessing}
                                                    >
                                                        Check Out ({book.copiesAvailable} available)
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-gray-400">No copies available</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : searchQuery && !isSearching ? (
                                    <p className="mt-2 text-sm text-gray-500">No books found matching your search.</p>
                                ) : null}
                            </div>

                            {/* ISBN Scanner Section */}
                            <div className="mt-6">
                                <h4 className="text-md font-medium text-gray-700">Scan ISBN to Check Out</h4>
                                <div className="mt-2">
                                    {isScanning ? (
                                        <>
                                            <div className="relative w-full h-64">
                                                <ISBNScanner onScan={handleScan} isActive={isScanning} />
                                            </div>
                                            <button
                                                onClick={() => setIsScanning(false)}
                                                className="mt-2 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
                                            >
                                                Stop Scanning
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsScanning(true)}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
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
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
                                    >
                                        {bookStatus.action === 'checkout' ? 'Confirm Checkout' : 'Confirm Return'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionPanelModal;
