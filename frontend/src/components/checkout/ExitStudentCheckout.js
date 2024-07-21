import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ExitStudentCheckout = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically verify the password with the backend
        // For demonstration, we'll use a hardcoded password
        if (password === 'password') {
            navigate('/');
        } else {
            setError('Incorrect password');
        }
    };

    return (
        <div className="fixed bottom-4 right-4">
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter teacher password"
                    className="w-full p-2 border rounded mb-2"
                    required
                />
                <button type="submit" className="w-full bg-red-500 text-white p-2 rounded">
                    Exit Student Mode
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default ExitStudentCheckout;