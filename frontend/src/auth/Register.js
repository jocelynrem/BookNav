import React, { useState } from 'react';
import { registerUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import LibraryImage from '../images/LibraryImage.jpg';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser({ username, email, password });
            // Navigate to login with state indicating registration success
            navigate('/login', { state: { message: 'Account created successfully. Please log in.' } });
        } catch (error) {
            console.error('Registration failed', error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
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
                                    Register a new account
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Already a member?{' '}
                                    <a href="/login" className="font-semibold text-teal-600 hover:text-teal-500">
                                        Sign in
                                    </a>
                                </p>
                            </div>

                            <div className="mt-10">
                                {error && <div className="text-red-500 mb-4">{error}</div>}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                            Username
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                autoComplete="username"
                                                required
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="block w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                            Email address
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
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

                                    <div>
                                        <button
                                            type="submit"
                                            className="flex w-full justify-center rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                                        >
                                            Register
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden lg:block lg:w-1/2 xl:w-3/5 h-80 lg:h-auto lg:flex lg:items-center">
                        <img
                            className="absolute inset-0 object-cover w-full h-full"
                            src={LibraryImage}
                            alt="Library"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
