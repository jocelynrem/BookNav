import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentPinAuth = ({ student, onSuccess }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pin === student.pin) {
            onSuccess();
        } else {
            setError('Incorrect PIN. Please try again.');
        }
    };

    return (
        <div className="flex justify-center bg-gray-100">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Enter your PIN
                </h2>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="pin" className="sr-only">
                                PIN
                            </label>
                            <input
                                id="pin"
                                name="pin"
                                type="tel"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your 4-digit PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength="4"
                                inputMode="numeric"
                                ref={inputRef}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm mt-2">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentPinAuth;
