import React, { useState } from 'react';
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid';

const ActivityList = ({ activities }) => (
    <ul className="divide-y divide-gray-200">
        {activities.map((activity, index) => (
            <li key={index} className="py-4">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                                <svg viewBox="0 0 6 6" aria-hidden="true" className={`h-1.5 w-1.5 ${activity.action === 'Checkout' ? 'fill-pink-500' : 'fill-green-500'}`}>
                                    <circle r={3} cx={3} cy={3} />
                                </svg>
                                {activity.action === 'Checkout' ? 'Checked Out' : 'Returned'}
                            </span>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                    </div>
                </div>
            </li>
        ))}
    </ul>
);

const RecentActivity = ({ activities = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Calculate the current page's activities
    const indexOfLastActivity = currentPage * itemsPerPage;
    const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
    const currentActivities = activities.slice(indexOfFirstActivity, indexOfLastActivity);

    // Calculate the total number of pages
    const totalPages = Math.ceil(activities.length / itemsPerPage);

    // Handlers for pagination controls
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

    return (
        <div className="flex flex-col bg-gray-50 rounded-lg min-h-[520px]">
            <div className="px-4 py-5 sm:p-3">

                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                <div className="flex-grow">
                    <ActivityList activities={currentActivities} />
                </div>
                <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
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
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${currentPage === i + 1
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
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
            </div>
        </div>
    );
};

export default RecentActivity;
