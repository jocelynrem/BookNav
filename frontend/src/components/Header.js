import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BuildingLibraryIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid';
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
        <header className="sticky top-0 z-30 bg-white shadow mb-8">
            <nav className="container mx-auto flex items-center justify-between max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
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
                                <Link to="/library/my-library" className="text-teal-800 hover:underline">
                                    My Library
                                </Link>
                                <Link to="/manage" className="text-teal-800 hover:underline">
                                    Students & Classes
                                </Link>
                                <Link to="/checkout/teacher" className="text-teal-800 hover:underline">
                                    Checkout Books
                                </Link>
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
                                to="/library/my-library"
                                className="block text-base font-semibold leading-7 text-teal-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                My Library
                            </Link>
                            <Link
                                to="/manage"
                                className="block text-base font-semibold leading-7 text-teal-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Students & Classes
                            </Link>
                            <Link
                                to="/checkout/teacher"
                                className="block text-base font-semibold leading-7 text-teal-800 hover:bg-gray-50 px-3 py-2 rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Checkout
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;