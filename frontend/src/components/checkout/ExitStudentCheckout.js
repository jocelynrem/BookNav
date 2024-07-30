import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';

const ExitStudentCheckout = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const passwordInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (showPasswordPrompt && passwordInputRef.current) {
            passwordInputRef.current.focus();
        }
    }, [showPasswordPrompt]);

    const handleExitClick = () => {
        setShowPasswordPrompt(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const teacherUsername = localStorage.getItem('teacherUsername');
            await loginUser({ usernameOrEmail: teacherUsername, password });
            navigate('/dashboard');
        } catch (error) {
            setError('Incorrect password');
        }
    };

    return (
        <div>
            {showPasswordPrompt ? (
                <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter teacher password"
                        className="w-full p-2 border rounded focus:ring-2 mb-2 focus:ring-teal-600"
                        required
                        ref={passwordInputRef}
                    />
                    <button type="submit" className="w-full bg-red-700 text-white p-2 rounded">
                        Confirm Exit
                    </button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
            ) : (
                <button
                    onClick={handleExitClick}
                    className="text-pink-600 hover:text-pink-800 font-bold py-2 px-4 rounded"
                >
                    Exit Student Mode
                </button>
            )}
        </div>
    );
};

export default ExitStudentCheckout;
