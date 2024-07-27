import React from 'react';

const UpcomingDueDates = ({ dueDates }) => {
    return (
        <div>
            <h2 className="text-lg font-medium text-teal-800 mb-4">Upcoming Due Dates</h2>
            <ul className="divide-y divide-gray-200">
                {dueDates.map((item, index) => (
                    <li key={index} className="py-4">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{item.book}</p>
                                <p className="text-sm text-gray-500">{item.student}</p>
                            </div>
                            <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UpcomingDueDates;