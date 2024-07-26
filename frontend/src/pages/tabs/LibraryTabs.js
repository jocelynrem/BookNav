import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon, BookOpenIcon, BuildingLibraryIcon } from '@heroicons/react/20/solid';

const tabs = [
    { name: 'My Library', href: '/library/my-library', icon: BuildingLibraryIcon },
    { name: 'Search to Add Book', href: '/library/add-book/search', icon: MagnifyingGlassIcon },
    { name: 'Manually Add Book', href: '/library/add-book/manual', icon: BookOpenIcon },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const LibraryTabs = () => {
    const location = useLocation();

    return (
        <div className="border-b border-gray-200 bg-white">
            <nav className="flex space-x-4 px-4 sm:px-6 lg:px-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        to={tab.href}
                        className={classNames(
                            location.pathname.startsWith(tab.href) ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
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
    );
};

export default LibraryTabs;
