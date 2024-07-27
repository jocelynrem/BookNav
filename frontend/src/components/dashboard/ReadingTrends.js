import React, { useEffect } from 'react';
import { ClockIcon, UserIcon, StarIcon, FireIcon } from '@heroicons/react/24/solid';

const ReadingTrends = ({
    popularBooks = [],
    averageCheckoutDuration = 0,
    topStudents = [],
    longestDurationBooks = [],
    shortestDurationBooks = []
}) => {
    useEffect(() => {
        console.log('Popular Books:', popularBooks);
        console.log('Average Checkout Duration:', averageCheckoutDuration);
        console.log('Top Students:', topStudents);
        console.log('Longest Duration Books:', longestDurationBooks);
        console.log('Shortest Duration Books:', shortestDurationBooks);
    }, [popularBooks, averageCheckoutDuration, topStudents, longestDurationBooks, shortestDurationBooks]);

    const trends = [
        { name: 'Avg. Checkout Duration', description: `${averageCheckoutDuration ? averageCheckoutDuration.toFixed(2) : 'N/A'} days`, icon: ClockIcon },
        { name: 'Top Students', description: topStudents.length > 0 ? `${topStudents[0].studentName} (${topStudents[0].checkouts} checkouts)` : 'No data available', icon: UserIcon },
        { name: 'Longest Duration Book', description: longestDurationBooks.length > 0 ? `${longestDurationBooks[0].name}: ${longestDurationBooks[0].durationInDays.toFixed(2)} days` : 'No data available', icon: StarIcon },
        { name: 'Shortest Duration Book', description: shortestDurationBooks.length > 0 ? `${shortestDurationBooks[0].name}: ${shortestDurationBooks[0].durationInDays.toFixed(2)} days` : 'No data available', icon: FireIcon },
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
