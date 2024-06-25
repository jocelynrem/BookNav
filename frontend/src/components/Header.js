import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon, MagnifyingGlassIcon, BookOpenIcon, BuildingLibraryIcon } from '@heroicons/react/20/solid';
import { logoutUser, getToken } from '../services/bookService'; // Adjust the path as needed

const actions = [
    {
        title: 'Search by title, author, or ISBN',
        description: 'Search our library to add a book.',
        href: '/add-search',
        icon: MagnifyingGlassIcon,
        iconClasses: 'text-gray-400 bg-gray-50 hover:text-pink-700 hover:bg-white',
        disabled: false,
    },
    {
        title: 'Add Manually',
        description: 'IN PROGRESS: check back later for this feature',
        href: '#',
        icon: BookOpenIcon,
        iconClasses: 'text-gray-400 bg-gray-50 hover:text-pink-700 hover:bg-white',
        disabled: true,
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = getToken();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const getMobileLink = () => {
        if (location.pathname === '/add-search') {
            return { to: '/', text: 'View Library' };
        } else if (location.pathname === '/') {
            return { to: '/add-search', text: 'Add a Book' };
        } else {
            return null;
        }
    };

    const mobileLink = getMobileLink();

    return (
        <header className="sticky top-0 z-30 bg-white shadow">
            <nav className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full" aria-label="Global">
                <div className="flex items-center space-x-6 py-4">
                    <div className="-m-1.5 p-1.5">
                        <BuildingLibraryIcon className="h-8 w-8 text-teal-800" />
                    </div>
                    {token && (
                        <div className="flex items-center space-x-6">
                            {mobileLink && (
                                <Link
                                    to={mobileLink.to}
                                    className="text-base font-semibold leading-7 text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg md:hidden"
                                >
                                    {mobileLink.text}
                                </Link>
                            )}
                            <Link to="/" className="hidden md:inline text-gray-800 hover:underline">
                                My Library
                            </Link>
                            <Popover className="relative hidden md:inline-block">
                                {({ open, close }) => (
                                    <>
                                        <PopoverButton className="inline-flex items-center text-gray-800 hover:underline focus:outline-none">
                                            Add Book
                                            <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-800" aria-hidden="true" />
                                        </PopoverButton>
                                        {open && (
                                            <PopoverPanel className="absolute left-0 mt-3 px-4 transition-transform transform-gpu duration-200 ease-out w-auto min-w-full sm:min-w-0 sm:w-screen sm:max-w-md lg:max-w-2xl">
                                                <div className="overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                                                    <div className="grid gap-4 p-4">
                                                        {actions.map((action) => (
                                                            <Link
                                                                key={action.title}
                                                                to={action.disabled ? '#' : action.href}
                                                                onClick={close}
                                                                className="group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-50 transition ease-in-out duration-150"
                                                            >
                                                                <div className={`h-10 w-10 flex-none items-center justify-center rounded-lg p-2 text-pink-700 bg-gray-100 group-hover:bg-pink-700 group-hover:text-gray-100`}>
                                                                    <action.icon className="h-6 w-6" aria-hidden="true" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold">
                                                                        {action.title}
                                                                        <span className="absolute inset-0" />
                                                                    </h3>
                                                                    <p className="mt-1">{action.description}</p>
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
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-6">
                    {token ? (
                        <button
                            onClick={handleLogout}
                            className="text-base font-semibold leading-7 text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                        >
                            Log out
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-base font-semibold leading-7 text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="text-base font-semibold leading-7 text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
