import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AcademicCapIcon, UserGroupIcon } from '@heroicons/react/20/solid';

const tabs = [
    { name: 'Manage Classes', href: '/manage/classes', icon: AcademicCapIcon },
    { name: 'Manage Students', href: '/manage/students', icon: UserGroupIcon },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const ManageTabs = () => {
    const location = useLocation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                <select
                    id="tabs"
                    name="tabs"
                    onChange={(e) => (window.location.href = tabs.find((tab) => tab.name === e.target.value).href)}
                    value={tabs.find((tab) => location.pathname.startsWith(tab.href))?.name || tabs[0].name}
                    className="block w-full rounded-md border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                >
                    {tabs.map((tab) => (
                        <option key={tab.name}>{tab.name}</option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <nav className="flex space-x-7 border-b border-gray-200 bg-white" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            to={tab.href}
                            className={classNames(
                                location.pathname.startsWith(tab.href)
                                    ? 'border-pink-600 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
                            )}
                            aria-current={location.pathname.startsWith(tab.href) ? 'page' : undefined}
                        >
                            <tab.icon
                                className={classNames(
                                    location.pathname.startsWith(tab.href) ? 'text-pink-600' : 'text-gray-400 group-hover:text-gray-500',
                                    '-ml-0.5 mr-2 h-5 w-5'
                                )}
                                aria-hidden="true"
                            />
                            <span>{tab.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default ManageTabs;
