import React, { useState } from 'react';
import { checkoutBook, returnBook } from '../../services/checkoutService';
import ISBNScanner from './ISBNScanner';

const TeacherCheckout = () => {
    const [isbn, setIsbn] = useState('');
    const [studentId, setStudentId] = useState('');
    const [action, setAction] = useState('checkout'); // 'checkout' or 'return'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (action === 'checkout') {
                await checkoutBook(isbn, studentId);
                setMessage(`Book checked out successfully to student ${studentId}`);
            } else {
                await returnBook(isbn);
                setMessage('Book returned successfully');
            }
            setIsbn('');
            setStudentId('');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Teacher Checkout</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">ISBN:</label>
                    <ISBNScanner onScan={setIsbn} />
                    <input
                        type="text"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                {action === 'checkout' && (
                    <div>
                        <label className="block mb-1">Student ID:</label>
                        <input
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                )}
                <div>
                    <label className="block mb-1">Action:</label>
                    <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="checkout">Checkout</option>
                        <option value="return">Return</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                    {action === 'checkout' ? 'Checkout Book' : 'Return Book'}
                </button>
            </form>
            {message && <p className="mt-4 text-center">{message}</p>}
        </div>
    );
};

export default TeacherCheckout;