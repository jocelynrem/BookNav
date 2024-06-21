import React from 'react';
import { Link } from 'react-router-dom';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon, QrCodeIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { BookOpenIcon as BookOpenOutlineIcon } from '@heroicons/react/24/outline';

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
        icon: BookOpenOutlineIcon,
        iconForeground: 'text-teal-700',
        iconBackground: 'bg-teal-50',
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Header = () => {
    return (
        <header className="bg-gray-800 text-white py-4 mb-8">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link to="/" className="flex items-center text-white hover:underline">
                        <BookOpenOutlineIcon className="h-8 w-8 mr-2 text-white" />
                        <h1 className="text-xl font-bold">BookNav</h1>
                    </Link>
                </div>
                <nav className="flex items-center">
                    <Link to="/" className="mr-4 text-white hover:underline">
                        My Library
                    </Link>
                    <Popover className="relative">
                        {({ open, close }) => (
                            <>
                                <PopoverButton className="inline-flex items-center text-white hover:underline focus:outline-none">
                                    Add Book
                                    <ChevronDownIcon className="ml-2 h-5 w-5 text-white" aria-hidden="true" />
                                </PopoverButton>
                                {open && (
                                    <PopoverPanel className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4 transition-transform transform-gpu duration-200 ease-out">
                                        <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 lg:max-w-3xl">
                                            <div className="grid grid-cols-1 gap-x-6 gap-y-1 p-4 lg:grid-cols-2">
                                                {actions.map((action) => (
                                                    <Link
                                                        key={action.title}
                                                        to={action.href}
                                                        onClick={close}
                                                        className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50 transition ease-in-out duration-150"
                                                    >
                                                        <div
                                                            className={classNames(
                                                                action.iconBackground,
                                                                'flex h-11 w-11 flex-none items-center justify-center rounded-lg group-hover:bg-white'
                                                            )}
                                                        >
                                                            <action.icon className={classNames('h-6 w-6', action.iconForeground, 'group-hover:text-indigo-600')} aria-hidden="true" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {action.title}
                                                                <span className="absolute inset-0" />
                                                            </h3>
                                                            <p className="mt-1 text-gray-600">{action.description}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverPanel>
                                )}
                            </>
                        )}
                    </Popover>
                </nav>
            </div>
        </header>
    );
};

export default Header;
