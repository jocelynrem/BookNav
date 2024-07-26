import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getOverviewStats,
    getRecentActivity,
    getReadingTrends,
    getUpcomingDueDates
} from '../services/dashboardService';
import {
    searchBooks,
    getCurrentCheckouts,
    returnBook
} from '../services/checkoutService';
import {
    BookOpenIcon, UserGroupIcon, CalendarIcon, ChartBarIcon,
    QrCodeIcon, PlusCircleIcon, ArrowPathIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ISBNScanner from '../components/checkout/ISBNScanner';
import { returnBookByISBN } from '../services/checkoutService';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [recentActivity, setRecentActivity] = useState([]);
    const [readingTrends, setReadingTrends] = useState({});
    const [upcomingDueDates, setUpcomingDueDates] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [isManualReturnOpen, setIsManualReturnOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [checkouts, setCheckouts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const overviewStats = await getOverviewStats();
        const activity = await getRecentActivity();
        const trends = await getReadingTrends();
        const dueDates = await getUpcomingDueDates();

        setStats(overviewStats);
        setRecentActivity(activity);
        setReadingTrends(trends);
        setUpcomingDueDates(dueDates);
    };

    const handleScanDashboard = async (isbn) => {
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
                console.error('Error response data:', error.response.data);
            }
            Swal.fire('Error', errorMessage, 'error');
        }
        setIsScanning(false);
        setShowScannerModal(false);
    };

    const toggleScanner = () => {
        setIsScanning(!isScanning);
        setShowScannerModal(!showScannerModal);
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
                Swal.fire('No books found', 'No books match the given title', 'info');
            } else {
                const allCheckouts = await Promise.all(books.map(book => getCurrentCheckouts(book._id)));
                const flattenedCheckouts = allCheckouts.flat();
                console.log("Checkouts:", flattenedCheckouts);
                setCheckouts(flattenedCheckouts);
            }
        } catch (error) {
            console.error('Error searching for book:', error);
            Swal.fire('Error', 'Failed to search for book. Please try again.', 'error');
        }
    };

    const handleReturnBook = async (checkoutId) => {
        try {
            await returnBook(checkoutId);
            Swal.fire('Success', 'Book returned successfully', 'success');
            // Refresh the checkouts list
            const updatedCheckouts = checkouts.filter(checkout => checkout._id !== checkoutId);
            setCheckouts(updatedCheckouts);
        } catch (error) {
            console.error('Error returning book:', error);
            Swal.fire('Error', 'Failed to return book. Please try again.', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-teal-700 my-8">Dashboard</h1>

            {/* Overview Statistics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Books" value={stats.totalBooks} icon={<BookOpenIcon className="h-6 w-6 text-teal-700" />} />
                <StatCard title="Checked Out" value={stats.checkedOutBooks} icon={<ArrowPathIcon className="h-6 w-6 text-teal-700" />} />
                <StatCard title="Overdue" value={stats.overdueBooks} icon={<ExclamationCircleIcon className="h-6 w-6 text-teal-700" />} />
                <StatCard title="Due Today" value={stats.dueTodayBooks} icon={<CalendarIcon className="h-6 w-6 text-teal-700" />} />
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-medium text-teal-800">Quick Actions</h2>
                <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ActionCard
                        title="Scan Return"
                        description="Return a book by scanning its ISBN"
                        icon={<QrCodeIcon className="h-8 w-8 text-pink-600" />}
                        onClick={() => setShowScannerModal(true)}
                    />
                    <ActionCard
                        title="Manual Return"
                        description="Return a book without ISBN"
                        icon={<BookOpenIcon className="h-8 w-8 text-pink-600" />}
                        onClick={handleManualReturn}
                    />
                    <ActionCard
                        title="Add New Book"
                        description="Add a new book to the library"
                        icon={<PlusCircleIcon className="h-8 w-8 text-pink-600" />}
                        onClick={() => navigate('/add-book')}
                    />
                    <ActionCard
                        title="Checkout Book"
                        description="Checkout a book to a student"
                        icon={<ArrowPathIcon className="h-8 w-8 text-pink-600" />}
                        onClick={() => navigate('/teacher-checkout')}
                    />
                </div>
            </div>

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
                                        placeholder="Enter book title"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    />
                                    <button
                                        onClick={handleSearchDashboard}
                                        className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:text-sm"
                                    >
                                        Search
                                    </button>
                                </div>
                                {/* Search Results and Checkouts */}
                                {searchResults.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-md font-medium text-gray-700 mb-2">Search Results</h4>
                                        {searchResults.map((book) => (
                                            <div key={book._id} className="mb-4 p-4 border rounded-md">
                                                <p className="text-sm font-medium text-gray-900">{book.title}</p>
                                                <p className="text-sm text-gray-500">{book.author}</p>

                                                {/* Checkouts for this book */}
                                                {checkouts.filter(checkout => checkout.bookCopy.book._id === book._id).length > 0 ? (
                                                    <div className="mt-2">
                                                        <h5 className="text-sm font-medium text-gray-700">Checked out by:</h5>
                                                        <ul className="divide-y divide-gray-200">
                                                            {checkouts
                                                                .filter(checkout => checkout.bookCopy.book._id === book._id)
                                                                .map((checkout) => (
                                                                    <li key={checkout._id} className="py-2 flex justify-between items-center">
                                                                        <p className="text-sm text-gray-500">
                                                                            {checkout.student.firstName} {checkout.student.lastName}
                                                                        </p>
                                                                        <button
                                                                            onClick={() => handleReturnBook(checkout._id)}
                                                                            className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                                                        >
                                                                            Return
                                                                        </button>
                                                                    </li>
                                                                ))
                                                            }
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <p className="mt-2 text-sm text-gray-500">This book is not currently checked out.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {checkouts.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-md font-medium text-gray-700 mb-2">Checked Out Books</h4>
                                        <ul className="divide-y divide-gray-200">
                                            {checkouts.map((checkout) => (
                                                <li key={checkout._id} className="py-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{checkout.bookCopy.book.title}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Checked out by: {checkout.student.firstName} {checkout.student.lastName}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleReturnBook(checkout._id)}
                                                        className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                                    >
                                                        Return
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
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

            {/* Recent Activity and Reading Trends */}
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                    <h2 className="text-lg font-medium text-teal-800">Recent Activity</h2>
                    <ActivityList activities={recentActivity} />
                </div>
            </div>

            {/* ISBN Scanner Modal */}
            {showScannerModal && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-teal-700">Scan ISBN</h3>
                                <div className="mt-2">
                                    {isScanning ? (
                                        <ISBNScanner onScan={handleScanDashboard} />
                                    ) : (
                                        <p>Click 'Start Scanning' to begin</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => setIsScanning(!isScanning)}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-base font-medium text-white hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                                >
                                    {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowScannerModal(false);
                                        setIsScanning(false);
                                    }}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
        <div className="p-5 border-l-4 border-teal-700">
            <div className="flex items-center">
                <div className="flex-shrink-0">{icon}</div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
);

const ActionCard = ({ title, description, icon, onClick }) => (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer" onClick={onClick}>
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0">{icon}</div>
                <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </div>
    </div>
)

const ActivityList = ({ activities }) => (
    <ul className="divide-y divide-gray-200">
        {activities.map((activity, index) => (
            <li key={index} className="py-4">
                <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.details}</p>
                    </div>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
            </li>
        ))}
    </ul>
);

const TrendsChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#4FD1C5" />
            <YAxis stroke="#4FD1C5" />
            <Tooltip />
            <Legend />
            <Bar dataKey="checkouts" fill="#F687B3" />
        </BarChart>
    </ResponsiveContainer>
);

export default Dashboard;
