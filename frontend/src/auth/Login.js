import React, { useState, useEffect } from 'react';
import { loginUser } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import LibraryImage from '../images/LibraryImage.jpg';

export default function LoginPage() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            login(token, 'user');
            navigate('/dashboard');
        }
    }, [location, login, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { token, role } = await loginUser({ usernameOrEmail, password });
            login(token, role);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed', error);
            setError(error.message || 'Login failed');
        }
    };

    return (
        <>
            <div className="container mx-auto max-w-7xl flex justify-center px-4 sm:px-6 lg:px-8">
                <div className="flex w-full flex-col lg:flex-row justify-between px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                    <div className="w-full lg:w-1/2 xl:w-2/5 lg:pr-16">
                        <div className="mx-auto max-w-md">
                            <div>
                                <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                                    Sign in to your account
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Not a member?{' '}
                                    <a href="/register" className="font-semibold text-teal-600 hover:text-teal-500">
                                        Register here
                                    </a>
                                </p>
                            </div>

                            <div className="mt-10">
                                {error && <div className="text-red-500 mb-4">{error}</div>}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="usernameOrEmail" className="block text-sm font-medium leading-6 text-gray-900">
                                            Username or Email
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="usernameOrEmail"
                                                name="usernameOrEmail"
                                                type="text"
                                                autoComplete="username"
                                                required
                                                value={usernameOrEmail}
                                                onChange={(e) => setUsernameOrEmail(e.target.value)}
                                                className="block w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                            Password
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                autoComplete="current-password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                                            />
                                            <label htmlFor="remember-me" className="ml-3 block text-sm leading-6 text-gray-700">
                                                Remember me
                                            </label>
                                        </div>

                                        <div className="text-sm leading-6">
                                            <a href="/reset-password" className="font-semibold text-teal-600 hover:text-teal-500">
                                                Forgot password?
                                            </a>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            className="flex w-full justify-center rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                                        >
                                            Sign in
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden lg:block lg:w-1/2 xl:w-3/5 h-80 lg:h-auto lg:flex lg:items-center"> {/* Set height for larger screens */}
                        <img
                            className="absolute inset-0 object-cover w-full h-full"
                            src={LibraryImage}
                            alt="Library Image"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
