import React from 'react';

const UpcomingDueDates = ({ dueDates }) => {
    return (
        <div>
            <h2 className="text-lg font-medium text-teal-800 mb-4">Upcoming Due Dates</h2>
            {dueDates && dueDates.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {dueDates.map((item, index) => (
                        <li key={index} className="py-4">
                            <div className="flex flex-col">
                                <div className="flex justify-between">
                                    <p className="text-sm font-medium text-gray-900">{item.book || 'Unknown Title'}</p>
                                    <p className="text-sm text-gray-500">{item.date || 'Unknown Date'}</p>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{item.student || 'Unknown Student'}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No upcoming due dates.</p>
            )}
        </div>
    );
};

export default UpcomingDueDates;
