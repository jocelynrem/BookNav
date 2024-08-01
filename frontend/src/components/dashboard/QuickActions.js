import React from 'react';
import { QrCodeIcon, BookOpenIcon, CogIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ActionCard = ({ title, description, icon, onClick }) => (
    <div className="bg-white overflow-hidden border-l-4 border-pink-600 shadow-lg rounded-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer" onClick={onClick}>
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0">{icon}</div>
                <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </div>
    </div>
);

const QuickActions = ({ onScanReturn, onManualReturn, onSettings, addBook }) => {
    return (
        <div className="mt-8">
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <ActionCard
                    title="Add Books"
                    description="Add a book to your library"
                    icon={<ArrowPathIcon className="h-8 w-8 text-pink-600" />}
                    onClick={addBook}
                />
                <ActionCard
                    title="Scan Return"
                    description="Return a book by scanning its ISBN"
                    icon={<QrCodeIcon className="h-8 w-8 text-pink-600" />}
                    onClick={onScanReturn}
                />
                <ActionCard
                    title="Manual Return"
                    description="Return a book without ISBN"
                    icon={<BookOpenIcon className="h-8 w-8 text-pink-600" />}
                    onClick={onManualReturn}
                />
                <ActionCard
                    title="Library Settings"
                    description="Adjust library settings"
                    icon={<CogIcon className="h-8 w-8 text-pink-600" />}
                    onClick={onSettings}
                />
            </div>
        </div>
    );
};


export default QuickActions;
