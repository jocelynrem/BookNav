import React, { useState, useEffect } from 'react';
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid';
import Swal from 'sweetalert2';
const moment = require('moment');

const ActivityItem = ({ activity, onBookReturn, handleReturnBook }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckIn = async (e) => {
        e.preventDefault();
        if (!activity.checkoutId || !activity.bookId) {
            Swal.fire('Error', 'Checkout information is missing for this book', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            await handleReturnBook(activity.checkoutId, activity.bookId);
            onBookReturn(); // Refresh the activity list
        } catch (error) {
            console.error('Error checking in book:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getBadgeClasses = (action, isHovered) => {
        const baseClasses = "inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium min-w-[90px] justify-center";
        if (action === 'Checkout') {
            return isHovered
                ? `${baseClasses} bg-pink-100 text-pink-700 ring-1 ring-inset ring-pink-700/10 cursor-pointer`
                : `${baseClasses} text-gray-900 ring-1 ring-inset ring-gray-200`;
        }
        return `${baseClasses} text-gray-900 ring-1 ring-inset ring-gray-200`;
    };

    const toggleHover = () => {
        setIsHovered((prev) => !prev);
    };

    return (
        <li className="py-3">
            <div className="flex justify-between items-center">
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3">
                        <span
                            className={getBadgeClasses(activity.action, isHovered)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={activity.action === 'Checkout' && !isProcessing ? (isHovered ? handleCheckIn : toggleHover) : undefined}
                        >
                            <svg viewBox="0 0 6 6" aria-hidden="true" className={`h-1.5 w-1.5 ${activity.action === 'Checkout' ? 'fill-pink-500' : 'fill-green-500'}`}>
                                <circle r={3} cx={3} cy={3} />
                            </svg>
                            {activity.action === 'Checkout'
                                ? (isHovered ? (isProcessing ? 'Processing...' : 'Check In') : 'Checked Out')
                                : 'Returned'
                            }
                        </span>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                </div>
            </div>
        </li>
    );
};

const ActivityList = ({ activities, onBookReturn, handleReturnBook }) => (
    <ul className="divide-y divide-gray-200">
        {activities.map((activity, index) => (
            <ActivityItem
                key={index}
                activity={activity}
                onBookReturn={onBookReturn}
                handleReturnBook={handleReturnBook}
            />
        ))}
    </ul>
);

const RecentActivity = ({ activities = [], onBookReturn, handleReturnBook }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [thisWeekActivities, setThisWeekActivities] = useState([]);
    const itemsPerPage = 5;

    useEffect(() => {
        const startOfWeek = moment().startOf('week');
        const endOfWeek = moment().endOf('week');

        const filteredActivities = activities.filter(activity => {
            const activityDate = moment(activity.time, 'MMMM D, YYYY, h:mm A');
            return activityDate.isBetween(startOfWeek, endOfWeek, null, '[]');
        });

        setThisWeekActivities(filteredActivities);
    }, [activities]);

    const indexOfLastActivity = currentPage * itemsPerPage;
    const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
    const currentActivities = thisWeekActivities.slice(indexOfFirstActivity, indexOfLastActivity);

    const totalPages = Math.ceil(thisWeekActivities.length / itemsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const showPagination = totalPages > 1;

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 3;
        let startPage, endPage;

        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + Math.floor(maxVisiblePages / 2) >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - Math.floor(maxVisiblePages / 2);
                endPage = currentPage + Math.floor(maxVisiblePages / 2);
            }
        }

        if (startPage > 1) {
            pageNumbers.push(
                <button key={1} onClick={() => setCurrentPage(1)} className="inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                    1
                </button>
            );
            if (startPage > 2) {
                pageNumbers.push(<span key="startEllipsis" className="px-2 pt-4">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${currentPage === i
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(<span key="endEllipsis" className="px-2 pt-4">...</span>);
            }
            pageNumbers.push(
                <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                    {totalPages}
                </button>
            );
        }

        return pageNumbers;
    };

    return (
        <div className="flex flex-col bg-gray-50 rounded-lg border-2 border-teal-800 shadow min-h-[520px] overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-teal-800">
                <h2 className="text-lg font-medium text-gray-200">This Week's Activity</h2>
            </div>
            <div className="flex-grow overflow-y-auto px-4 sm:px-6">
                <ActivityList activities={currentActivities} onBookReturn={onBookReturn} handleReturnBook={handleReturnBook} />
            </div>
            {showPagination && (
                <nav className="flex items-center justify-between border-t border-gray-200 px-4 py-4 sm:px-6 flex-none">
                    <div className="-mt-px flex w-0 flex-1">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        >
                            <ArrowLongLeftIcon aria-hidden="true" className="mr-3 h-5 w-5 text-gray-400" />
                            Previous
                        </button>
                    </div>
                    <div className="hidden md:-mt-px md:flex">
                        {renderPageNumbers()}
                    </div>
                    <div className="-mt-px flex w-0 flex-1 justify-end">
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        >
                            Next
                            <ArrowLongRightIcon aria-hidden="true" className="ml-3 h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                </nav>
            )}
        </div>
    );
};

export default RecentActivity;