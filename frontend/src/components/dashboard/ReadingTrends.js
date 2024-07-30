import React from 'react';
import { BookOpenIcon, ClockIcon } from '@heroicons/react/24/solid';

const ReadingTrends = ({ data }) => {
    const { popularBooks = [], averageCheckoutDuration = 0 } = data;

    const formatDuration = (days) => {
        if (typeof days === 'number' && !isNaN(days)) {
            if (days < 1) {
                const hours = Math.round(days * 24);
                return `${hours} hours`;
            } else if (days >= 1) {
                const roundedDays = Math.floor(days);
                return `${roundedDays} ${roundedDays === 1 ? 'day' : 'days'}`;
            }
        }
        return 'N/A';
    };

    return (
        <div className="flex flex-col bg-gray-50 rounded-lg border-2 border-teal-800 shadow min-h-[520px] overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-teal-800">
                <h2 className="text-lg font-medium text-gray-200">Reading Trends</h2>
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="px-4 py-5 sm:p-6 space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm ">
                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                            <ClockIcon className="h-5 w-5 mr-2 text-teal-800" />
                            Average Checkout Duration
                        </h3>
                        <p className="text-xl font-bold text-gray-700">{formatDuration(averageCheckoutDuration)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                            <BookOpenIcon className="h-5 w-5 mr-2 text-teal-800" />
                            Top 5 Most Checked Out Books
                        </h3>
                        {popularBooks.length > 0 ? (
                            <ul className="space-y-2">
                                {popularBooks.map((book, index) => (
                                    <li key={book._id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                        <span className="text-sm font-semibold text-teal-800">{book.name}</span>
                                        <span className="text-sm text-gray-700 ">{book.checkouts} checkouts</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No checkout data</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadingTrends;