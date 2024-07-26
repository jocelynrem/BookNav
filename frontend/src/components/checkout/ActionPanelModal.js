import React, { useState, useEffect, useRef } from 'react';
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
    const [isProcessing, setIsProcessing] = useState(false); // Add this line
    const modalRef = useRef();
    const streamRef = useRef(null);

    useEffect(() => {
        if (isOpen && student) {
            fetchCheckedOutBooks();
        }
    }, [isOpen, student]);

    const startScanning = async () => {
        setIsScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
        } catch (error) {
            console.error('Failed to start scanning:', error);
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    useEffect(() => {
        if (!isOpen) {
            stopScanning();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                stopScanning();
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            stopScanning();
        };
    }, [onClose]);

    const fetchCheckedOutBooks = async () => {
        try {
            const books = await getCurrentCheckouts(student._id);
            setCheckedOutBooks(books); // Update state with the latest list of checked-out books
        } catch (error) {
            console.error('Failed to fetch checked out books:', error);
        }
    };

    const handleReturn = async (checkoutRecordId) => {
        try {
            if (isProcessing) return; // Prevent multiple submissions
            setIsProcessing(true);

            const updatedCheckout = await returnBook(checkoutRecordId);
            Swal.fire('Success', 'Book returned successfully', 'success');

            // Refresh the list of checked-out books
            await fetchCheckedOutBooks();
        } catch (error) {
            console.error('Failed to return book:', error);
            let errorMessage = 'Failed to return book. Please try again.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            Swal.fire('Error', errorMessage, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSearchActionPanel = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchBooks(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Failed to search books:', error);
            let errorMessage = 'Failed to search books. Please try again.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            Swal.fire('Error', errorMessage, 'error');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCheckout = async (bookId) => {
        try {
            if (isProcessing) return;
            setIsProcessing(true);

            // Check if the book is already checked out by the student
            const currentCheckouts = await getCurrentCheckouts(student._id);
            console.log('Current checkouts:', currentCheckouts);
            const isAlreadyCheckedOut = currentCheckouts.some(checkout =>
                checkout.bookCopy && checkout.bookCopy.book && checkout.bookCopy.book._id === bookId
            );

            if (isAlreadyCheckedOut) {
                Swal.fire('Error', 'This book is already checked out.', 'error');
                return;
            }

            // Proceed with checkout if the book is not already checked out
            const checkoutResult = await checkoutBook(bookId, student._id);
            console.log('Checkout result:', checkoutResult);
            await fetchCheckedOutBooks();
            setSearchResults([]);
            setSearchQuery('');
            Swal.fire('Success', 'Book checked out successfully', 'success');
        } catch (error) {
            console.error('Failed to check out book:', error);
            let errorMessage = 'Failed to check out book. Please try again.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            Swal.fire('Error', errorMessage, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckoutScan = async (scannedCode) => {
        if (scannedCode && !isProcessing) {
            let normalizedISBN = scannedCode;

            // Convert to ISBN-13 if necessary
            if (scannedCode.length === 10) {
                normalizedISBN = convertToISBN13(scannedCode);
            } else if (!scannedCode.startsWith('978')) {
                normalizedISBN = `978${scannedCode}`; // Ensure it starts with '978' for ISBN-13 format
            }
            // setQuery(normalizedISBN); // Remove or replace this line if needed
            setIsScanning(false);

            setIsProcessing(true);
            try {
                const results = await searchBooks(normalizedISBN);
                if (results.length === 0) {
                    Swal.fire('Error', 'Book not found in the library system.', 'error');
                } else {
                    // Assuming the first result is the desired book
                    const book = results[0];
                    await handleCheckout(book._id);
                }
            } catch (error) {
                console.error('Error during book search or checkout:', error);
                Swal.fire('Error', 'An error occurred while trying to check out the book. Please try again.', 'error');
            } finally {
                setIsProcessing(false);
            }
        } else {
            console.error('Invalid barcode scanned');
            setError('Invalid barcode scanned');
        }
    };

    const convertToISBN13 = (isbn10) => {
        // Convert ISBN-10 to ISBN-13
        return `978${isbn10.substring(0, 9)}` + calculateCheckDigit(`978${isbn10.substring(0, 9)}`);
    };

    const calculateCheckDigit = (isbn) => {
        // Calculate the check digit for the ISBN-13
        let sum = 0;
        for (let i = 0; i < isbn.length; i++) {
            sum += (i % 2 === 0 ? 1 : 3) * parseInt(isbn.charAt(i), 10);
        }
        let checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit.toString();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    ref={modalRef}
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                >
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                        <button
                            type="button"
                            className="absolute top-0 right-0 mt-3 mr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            onClick={() => {
                                stopScanning();
                                onClose();
                            }}
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
                                            {checkedOutBooks.map((bookCopy) => (
                                                <li key={bookCopy._id} className="py-2 flex justify-between items-center">
                                                    <span className="text-sm text-gray-900">
                                                        {bookCopy.bookCopy?.book?.title || 'Unknown Title'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleReturn(bookCopy._id)}
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
                                                    <span className="text-sm text-gray-900">{book.title}</span>
                                                    <button
                                                        onClick={() => handleCheckout(book._id)}
                                                        className="text-sm text-pink-600 hover:text-pink-900"
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
                                                <ISBNScanner onScan={handleCheckoutScan} />
                                                <button
                                                    onClick={stopScanning}
                                                    className="mt-2 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
                                                >
                                                    Stop Scanning
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={startScanning}
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
        </div>
    );
};

export default ActionPanelModal;
