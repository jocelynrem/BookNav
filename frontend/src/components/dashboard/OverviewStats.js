import React from 'react';
import { BookOpenIcon, ArrowPathIcon, ExclamationCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

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

const OverviewStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Books" value={stats.totalBooks} icon={<BookOpenIcon className="h-6 w-6 text-teal-700" />} />
            <StatCard title="Checked Out" value={stats.checkedOutBooks} icon={<ArrowPathIcon className="h-6 w-6 text-teal-700" />} />
            <StatCard title="Overdue" value={stats.overdueBooks} icon={<ExclamationCircleIcon className="h-6 w-6 text-teal-700" />} />
            {/* <StatCard title="Due Today" value={stats.dueTodayBooks} icon={<CalendarIcon className="h-6 w-6 text-teal-700" />} /> */}
        </div>
    );
};

export default OverviewStats;