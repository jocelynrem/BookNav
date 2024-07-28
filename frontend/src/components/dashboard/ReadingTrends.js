import React from 'react';
import { ClockIcon, BookOpenIcon, StarIcon, FireIcon } from '@heroicons/react/24/solid';

const ReadingTrends = ({ data }) => {
    const {
        popularBooks = [],
        averageCheckoutDuration = 0,
        longestDurationBooks = [],
        shortestDurationBooks = []
    } = data;

    const formatDuration = (days) => {
        if (typeof days === 'number' && !isNaN(days)) {
            return `${days.toFixed(1)} days`;
        }
        return 'N/A';
    };

    const trends = [
        {
            name: 'Avg. Checkout Duration',
            description: formatDuration(averageCheckoutDuration),
            icon: ClockIcon
        },
        {
            name: 'Top 3 Checked Out Books',
            description: popularBooks.length > 0
                ? popularBooks.map(book => `${book.name} (${book.checkouts})`).join(', ')
                : 'No data available',
            icon: BookOpenIcon
        },
        {
            name: 'Longest Duration Book',
            description: longestDurationBooks.length > 0
                ? `${longestDurationBooks[0].name}: ${formatDuration(longestDurationBooks[0].durationInDays)}`
                : 'No data available',
            icon: StarIcon
        },
        {
            name: 'Shortest Duration Book',
            description: shortestDurationBooks.length > 0
                ? `${shortestDurationBooks[0].name}: ${formatDuration(shortestDurationBooks[0].durationInDays)}`
                : 'No data available',
            icon: FireIcon
        },
    ];

    return (
        <div className="bg-white shadow border- py-4 rounded-lg lg:py-8 w-full">
            <h2 className="sr-only">Reading Trends</h2>
            <div className="mx-auto max-w-full lg:max-w-7xl divide-y divide-gray-200 lg:flex lg:justify-center lg:divide-x lg:divide-y-0 lg:py-8">
                {trends.map((trend, trendIdx) => (
                    <div key={trendIdx} className="py-8 lg:w-1/4 lg:flex-none lg:py-0">
                        <div className="mx-auto flex max-w-xs items-center px-4 lg:max-w-none lg:px-8">
                            <trend.icon aria-hidden="true" className="h-8 w-8 flex-shrink-0 text-teal-600" />
                            <div className="ml-4 flex flex-auto flex-col-reverse">
                                <h3 className="font-medium text-gray-900">{trend.name}</h3>
                                <p className="text-sm text-gray-500">{trend.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReadingTrends;