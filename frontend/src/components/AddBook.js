import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, QrCodeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const actions = [
    {
        title: 'Search by ISBN',
        description: 'Scan or enter ISBN to add a book.',
        href: '/add-isbn',
        icon: QrCodeIcon,
        iconForeground: 'text-purple-700',
        iconBackground: 'bg-purple-50',
    },
    {
        title: 'Add by searching our Library',
        description: 'Search by title to add a book.',
        href: '/add-search',
        icon: MagnifyingGlassIcon,
        iconForeground: 'text-sky-700',
        iconBackground: 'bg-sky-50',
    },
    {
        title: 'Add Manually',
        description: 'Fill out the form to add a book manually.',
        href: '/add-manual',
        icon: BookOpenIcon,
        iconForeground: 'text-teal-700',
        iconBackground: 'bg-teal-50',
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const AddBook = () => {
    return (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-100 shadow sm:grid sm:grid-cols-6 sm:gap-6 sm:divide-y-0 py-8">
            {actions.map((action, actionIdx) => (
                <div
                    key={action.title}
                    className={classNames(
                        'col-span-4 col-start-2 group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 shadow rounded-lg',
                    )}
                >
                    <div>
                        <span
                            className={classNames(
                                action.iconBackground,
                                action.iconForeground,
                                'inline-flex rounded-lg p-3 ring-4 ring-white',
                            )}
                        >
                            <action.icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            <Link to={action.href} className="focus:outline-none">
                                <span className="absolute inset-0" aria-hidden="true" />
                                {action.title}
                            </Link>
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                    </div>
                    <span
                        className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                        aria-hidden="true"
                    >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                        </svg>
                    </span>
                </div>
            ))}
        </div>
    );
};

export default AddBook;
