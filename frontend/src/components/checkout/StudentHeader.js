import React from 'react';
import { BuildingLibraryIcon } from '@heroicons/react/20/solid';
import ExitStudentCheckout from './ExitStudentCheckout';

const StudentHeader = () => {
    return (
        <header className="bg-white shadow">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-teal-700 py-4 sm:py-6 lg:border-none">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <BuildingLibraryIcon className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                        <span className="ml-3 text-lg sm:text-xl font-bold text-gray-900">Student Library</span>
                    </div>
                    <div className="ml-0 sm:ml-10 space-x-4">
                        <ExitStudentCheckout />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default StudentHeader;
