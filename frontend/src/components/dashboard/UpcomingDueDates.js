import React from 'react';

const UpcomingDueDates = ({ dueDates }) => {
    return (
        <div className="bg-white shadow rounded-lg flex flex-col h-full w-full pt-4 pb-4 pl-4">
            <div className="px-4 py-2 sm:p-2">
                <h3 className="text-md leading-6 font-medium text-gray-900">Upcoming Due Dates</h3>
            </div>
            <div className="px-4 py-2 sm:p-2 overflow-y-auto flex-1">
                {dueDates && dueDates.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {dueDates.map((item, index) => (
                            <li key={index} className="py-3">
                                <div className="flex flex-col">
                                    <div className="flex justify-between">
                                        <p className="text-sm font-medium text-gray-900">{item.book || 'Unknown Title'}</p>
                                        <p className="text-sm text-gray-500">{item.date || 'Unknown Date'}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.student || 'Unknown Student'}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No upcoming due dates.</p>
                )}
            </div>
        </div>
    );
};

export default UpcomingDueDates;
