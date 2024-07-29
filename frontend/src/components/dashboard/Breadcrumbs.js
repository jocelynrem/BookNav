import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-teal-600">
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Dashboard
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                            <Link
                                to={item.href}
                                className="ml-1 text-sm font-medium text-gray-700 hover:text-teal-600 md:ml-2"
                            >
                                {item.name}
                            </Link>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;