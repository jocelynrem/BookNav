import React, { useState, useEffect } from 'react';
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid';
import ActivityItem from './ActivityItem';
const moment = require('moment');

const RecentActivity = ({ activities = [] }) => {
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
                {thisWeekActivities.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No activity yet. It's a great week for reading!
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {currentActivities.map((activity, index) => (
                            <ActivityItem key={index} activity={activity} />
                        ))}
                    </ul>
                )}
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
