import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
    getOverviewStats,
    getRecentActivity,
    getReadingTrends,
    getUpcomingDueDates,
    getOverdueBooks
} from '../services/dashboardService';
import {
    returnBookByISBN,
    searchBooks,
    getCurrentCheckoutsForBook,
    returnBook
} from '../services/checkoutService';
import OverviewStats from '../components/dashboard/OverviewStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import ReadingTrends from '../components/dashboard/ReadingTrends';
import UpcomingDueDates from '../components/dashboard/UpcomingDueDates';
import OverdueBooks from '../components/dashboard/OverdueBooks';
import QuickActions from '../components/dashboard/QuickActions';
import LibrarySettings from '../components/dashboard/LibrarySettings';
import ISBNScanner from '../components/checkout/ISBNScanner';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [recentActivity, setRecentActivity] = useState([]);
    const [readingTrends, setReadingTrends] = useState([]);
    const [upcomingDueDates, setUpcomingDueDates] = useState([]);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [isManualReturnOpen, setIsManualReturnOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [checkouts, setCheckouts] = useState([]);
    const [currentCheckouts, setCurrentCheckouts] = useState({});
    const [allCheckouts, setAllCheckouts] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const scannerModalRef = useRef(null);
    const manualReturnModalRef = useRef(null);
    const settingsModalRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (scannerModalRef.current && !scannerModalRef.current.contains(event.target)) {
                setShowScannerModal(false);
                setIsScanning(false);
            }
            if (manualReturnModalRef.current && !manualReturnModalRef.current.contains(event.target)) {
                setIsManualReturnOpen(false);
            }
            if (settingsModalRef.current && !settingsModalRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [overviewStats, activity, trends, dueDates] = await Promise.all([
                getOverviewStats(),
                getRecentActivity(),
                getReadingTrends(),
                getUpcomingDueDates()
            ]);

            setStats(overviewStats);
            setRecentActivity(activity);
            setReadingTrends(trends);
            setUpcomingDueDates(dueDates);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            Swal.fire('Error', 'Failed to fetch dashboard data. Please try again.', 'error');
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleScanReturn = async (isbn) => {
        try {
            console.log(`Scanned ISBN: ${isbn}`);
            const result = await returnBookByISBN(isbn);
            if (result.message && result.message.includes('reconciled')) {
                Swal.fire('Info', result.message, 'info');
            } else {
                Swal.fire('Success', 'Book returned successfully', 'success');
            }
            fetchDashboardData(); // Refresh dashboard data
        } catch (error) {
            console.error('Error returning book by ISBN:', error);
            let errorMessage = 'Failed to return book. Please try again.';
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message;
            }
            Swal.fire('Error', errorMessage, 'error');
        }
        setIsScanning(false);
        setShowScannerModal(false);
    };

    const handleSettings = () => {
        setIsSettingsOpen(true);
    };

    const handleManualReturn = () => {
        setIsManualReturnOpen(true);
        setSearchQuery('');
        setSearchResults([]);
        setCheckouts([]);
    };

    const handleSearchDashboard = async () => {
        console.log("Searching for:", searchQuery);
        try {
            const books = await searchBooks(searchQuery);
            console.log("Search results:", books);
            setSearchResults(books);

            if (books.length === 0) {
                Swal.fire('No books found', 'No books match the given search query', 'info');
            } else {
                const checkoutsData = {};
                for (const book of books) {
                    try {
                        console.log(`Fetching checkouts for book: ${book.title} (ID: ${book._id})`);
                        const bookCheckouts = await getCurrentCheckoutsForBook(book._id);
                        checkoutsData[book._id] = bookCheckouts;
                    } catch (error) {
                        console.error(`Error fetching checkouts for book ${book._id}:`, error);
                        checkoutsData[book._id] = [];
                    }
                }
                console.log("Current checkouts data:", checkoutsData);
                setCurrentCheckouts(checkoutsData);
            }
        } catch (error) {
            console.error('Error searching for book:', error);
            Swal.fire('Error', 'Failed to search for book. Please try again.', 'error');
        }
    };

    const handleReturnBook = async (checkoutId, bookId) => {
        try {
            await returnBook(checkoutId);
            Swal.fire({
                title: 'Success',
                text: 'Book returned successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // Refresh the checkouts for this book
            const updatedCheckouts = await getCurrentCheckoutsForBook(bookId);
            setCurrentCheckouts(prev => ({
                ...prev,
                [bookId]: updatedCheckouts
            }));

            // Refresh dashboard data
            await fetchDashboardData();

            // Close the Manual Return modal if all books are returned
            const allBooksReturned = Object.values(currentCheckouts).every(checkouts => checkouts.length === 0);
            if (allBooksReturned) {
                setIsManualReturnOpen(false);
            }
        } catch (error) {
            console.error('Error returning book:', error);
            Swal.fire('Error', 'Failed to return book. Please try again.', 'error');
        }
    };

    const handleAddBook = () => {
        navigate('/library/add-book/search');
    };

    const handleCheckout = () => {
        navigate('/teacher-checkout');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-teal-700 my-8">Dashboard</h1>

            <OverviewStats stats={stats} />

            <QuickActions
                onScanReturn={() => setShowScannerModal(true)}
                onManualReturn={handleManualReturn}
                onSettings={handleSettings} // Use the new handler
                onCheckout={handleCheckout}
            />

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <RecentActivity activities={recentActivity} />
                <OverdueBooks overdueBooks={overdueBooks} />
                {/* <ReadingTrends data={readingTrends} /> */}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <UpcomingDueDates dueDates={upcomingDueDates} />
            </div>

            <div className="mt-8">
            </div>

            {/* ISBN Scanner Modal */}
            {showScannerModal && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div
                            ref={scannerModalRef}
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start sm:justify-between">
                                    <h3 className="text-lg leading-6 font-medium text-teal-700">Scan ISBN</h3>
                                    <button
                                        onClick={() => setShowScannerModal(false)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="mt-2">
                                    {isScanning ? (
                                        <ISBNScanner onScan={handleScanReturn} />
                                    ) : (
                                        <p>Click 'Start Scanning' to begin</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Return Modal */}
            {isManualReturnOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-pink-700 mb-4">Manual Return</h3>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchDashboard();
                                            }
                                        }}
                                        placeholder="Enter book title or author"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    />
                                    <button
                                        onClick={handleSearchDashboard}
                                        className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
                                    >
                                        Search
                                    </button>
                                </div>

                                {/* Search Results and Current Checkouts */}
                                {searchResults.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-md font-medium text-gray-700 mb-2">Search Results</h4>
                                        {searchResults.map((book) => (
                                            <div key={book._id} className="mb-4 p-4 border rounded-md">
                                                <p className="text-sm font-medium text-gray-900">{book.title}</p>
                                                <p className="text-sm text-gray-500">{book.author}</p>

                                                {/* Current Checkouts for this book */}
                                                {currentCheckouts[book._id] && currentCheckouts[book._id].length > 0 ? (
                                                    <div className="mt-2">
                                                        <h5 className="text-sm font-medium text-gray-700">Currently Checked Out:</h5>
                                                        <ul className="divide-y divide-gray-200">
                                                            {currentCheckouts[book._id].map((checkout) => (
                                                                <li key={checkout._id} className="py-2 flex justify-between items-center">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            {checkout.student.firstName} {checkout.student.lastName}
                                                                            {checkout.bookCopy && ` (Copy #${checkout.bookCopy.copyNumber})`}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">
                                                                            Due: {new Date(checkout.dueDate).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleReturnBook(checkout._id, book._id)}
                                                                        className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                                                    >
                                                                        Return
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <p className="mt-2 text-sm text-gray-500">This book is not currently checked out.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => setIsManualReturnOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Library Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div
                            ref={settingsModalRef}
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start sm:justify-between">
                                    <h3 className="text-lg leading-6 font-medium text-teal-700">Library Settings</h3>
                                    <button
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <LibrarySettings />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;