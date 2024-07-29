import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon, onClick }) => (
    <div
        className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between h-full"
        onClick={onClick}
    >
        <div className="p-5 border-l-4 border-teal-700 flex-grow flex flex-col justify-between">
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
    const navigate = useNavigate();

    const handleTotalBooksClick = () => {
        navigate('/library/my-library');
    };

    const handleCheckedOutClick = () => {
        navigate('/checked-out-books');
    };

    const handleOverdueClick = () => {
        navigate('/overdue-books');
    };

    return (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Total Books"
                value={stats.totalBooks}
                icon={<BookOpenIcon className="h-6 w-6 text-teal-700" />}
                onClick={handleTotalBooksClick}
            />
            <StatCard
                title="Checked Out"
                value={stats.checkedOutBooks}
                icon={<ArrowPathIcon className="h-6 w-6 text-teal-700" />}
                onClick={handleCheckedOutClick}
            />
            <StatCard
                title="Overdue"
                value={stats.overdueBooks}
                icon={<ExclamationCircleIcon className="h-6 w-6 text-teal-700" />}
                onClick={handleOverdueClick}
            />
        </div>
    );
};

export default OverviewStats;