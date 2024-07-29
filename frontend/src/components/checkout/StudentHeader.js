import React from 'react';
import { BuildingLibraryIcon } from '@heroicons/react/20/solid';
import ExitStudentCheckout from './ExitStudentCheckout';

const StudentHeader = () => {
    return (
        <header className="bg-white shadow">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between border-b border-indigo-500 py-6 lg:border-none">
                    <div className="flex items-center">
                        <BuildingLibraryIcon className="h-10 w-10 text-indigo-600" />
                        <span className="ml-3 text-xl font-bold text-gray-900">Student Library</span>
                    </div>
                    <div className="ml-10 space-x-4">
                        <ExitStudentCheckout />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default StudentHeader;