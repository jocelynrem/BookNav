import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon, MagnifyingGlassIcon, BookOpenIcon, BuildingLibraryIcon, UserGroupIcon, AcademicCapIcon, IdentificationIcon, Bars3Icon, XMarkIcon, HomeIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/authService';

const addBookActions = [
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
        description: 'Enter the book details manually',
        href: '/add-manual',
        icon: BookOpenIcon,
        iconClasses: 'text-gray-400 bg-gray-50 hover:text-pink-700 hover:bg-white',
        disabled: false,
    },
];

const manageActions = [
    {
        title: 'Manage Classes',
        description: 'View and manage all classes.',
        href: '/manage-classes',
        icon: AcademicCapIcon,
    },
    {
        title: 'Manage Students',
        description: 'View and manage all students.',
        href: '/manage-students',
        icon: UserGroupIcon,
    },
    {
        title: 'Teacher Checkout',
        description: 'Checkout or return books for students.',
        href: '/teacher-checkout',
        icon: IdentificationIcon,
    },
    {
        title: 'Student Checkout',
        description: 'Allow students to checkout or return books.',
        href: '/student-checkout',
        icon: BookOpenIcon,
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logoutUser();
        logout();
        navigate('/login');
    };

    const renderDropdown = (buttonText, actions) => (
        <Popover className="relative">
            {({ open, close }) => (
                <>
                    <PopoverButton className="inline-flex items-center text-teal-800 hover:underline focus:outline-none">
                        {buttonText}
                        <ChevronDownIcon className="ml-2 h-5 w-5 text-teal-800" aria-hidden="true" />
                    </PopoverButton>
                    {open && (
                        <PopoverPanel className="absolute left-0 mt-3 px-4 w-screen max-w-md lg:max-w-2xl">
                            <div className="overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                                <div className="grid gap-4 p-4">
                                    {actions.map((action) => (
                                        <Link
                                            key={action.title}
                                            to={action.disabled ? '#' : action.href}
                                            onClick={() => {
                                                if (!action.disabled) {
                                                    navigate(action.href);
                                                    close();
                                                }
                                            }}
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
    );

    return (
        <header className="sticky top-0 z-30 bg-white shadow">
            <nav className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full" aria-label="Global">
                <div className="flex items-center space-x-6 py-4">
                    <div className="-m-1.5 p-1.5">
                        <BuildingLibraryIcon className="h-8 w-8 text-teal-800" />
                    </div>
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-teal-800 hover:bg-gray-50 p-2 rounded-lg"
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" className="text-teal-800 hover:underline">
                                    Dashboard
                                </Link>
                                <Link to="/" className="text-teal-800 hover:underline">
                                    My Library
                                </Link>
                                {renderDropdown("Manage", manageActions)}
                                {renderDropdown("Add Book", addBookActions)}
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="text-base font-semibold leading-7 text-teal-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                        >
                            Log out
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-base font-semibold leading-7 text-teal-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
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
            {mobileMenuOpen && (
                <div className="md:hidden bg-white shadow-lg">
                    {isAuthenticated && (
                        <div className="px-4 py-6 space-y-4">
                            <Link
                                to="/dashboard"
                                className="block text-base font-semibold leading-7 text-teal-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/"
                                className="block text-base font-semibold leading-7 text-teal-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                My Library
                            </Link>
                            <div>
                                {renderDropdown("Manage", manageActions)}
                            </div>
                            <div>
                                {renderDropdown("Add Book", addBookActions)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;