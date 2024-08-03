import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, BookOpenIcon, UserGroupIcon, HomeIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/authService';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logoutUser();
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-30 bg-teal-800 shadow-lg">
            <nav className="container mx-auto flex items-center justify-between max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
                <div className="flex items-center space-x-6 py-4">
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-teal-700 hover:bg-white p-2 rounded-lg"
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
                                <Link to="/dashboard" className="text-gray-100 font-medium hover:text-teal-700 hover:bg-gray-100 px-3 py-2 rounded-md flex items-center space-x-1 transition duration-300 ease-in-out">
                                    <HomeIcon className="h-5 w-5" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link to="/library/my-library" className="text-gray-100 font-medium hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md flex items-center space-x-1 transition duration-300 ease-in-out">
                                    <BookOpenIcon className="h-5 w-5" />
                                    <span>My Library</span>
                                </Link>
                                <Link to="/manage" className="text-gray-100 font-medium hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md flex items-center space-x-1 transition duration-300 ease-in-out">
                                    <UserGroupIcon className="h-5 w-5" />
                                    <span>Students & Classes</span>
                                </Link>
                                <Link to="/checkout/teacher" className="text-gray-100 font-medium hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md flex items-center space-x-1 transition duration-300 ease-in-out">
                                    <BookOpenIcon className="h-5 w-5" />
                                    <span>Checkout Books</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="text-base font-medium leading-7 text-gray-100 hover:text-teal-700 hover:bg-gray-100 px-3 py-2 rounded-md transition duration-300 ease-in-out"
                        >
                            Log out
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-base font-medium leading-7 text-gray-100 hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md transition duration-300 ease-in-out"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="text-base font-medium leading-7 text-gray-100 hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md transition duration-300 ease-in-out"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
            {mobileMenuOpen && (
                <div className="md:hidden bg-teal-700 shadow-lg">
                    {isAuthenticated && (
                        <div className="px-4 py-6 space-y-4">
                            <Link
                                to="/dashboard"
                                className="text-base font-medium leading-7 text-gray-100 hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md flex items-center space-x-1 transition duration-300 ease-in-out"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <HomeIcon className="h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/library/my-library"
                                className="text-base font-medium leading-7 text-gray-100 hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md flex items-center space-x-1 transition duration-300 ease-in-out"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <BookOpenIcon className="h-5 w-5" />
                                <span>My Library</span>
                            </Link>
                            <Link
                                to="/manage"
                                className="text-base font-medium leading-7 text-gray-100 hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md flex items-center space-x-1 transition duration-300 ease-in-out"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <UserGroupIcon className="h-5 w-5" />
                                <span>Students & Classes</span>
                            </Link>
                            <Link
                                to="/checkout/teacher"
                                className="text-base font-medium leading-7 text-gray-100 hover:text-teal-700 hover:bg-gray-100  px-3 py-2 rounded-md flex items-center space-x-1 transition duration-300 ease-in-out"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <BookOpenIcon className="h-5 w-5" />
                                <span>Checkout</span>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
