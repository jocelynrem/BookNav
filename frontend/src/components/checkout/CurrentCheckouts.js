import React from 'react';
import { returnBook } from '../../services/checkoutService';

const CurrentCheckouts = ({ checkouts, onReturn }) => {
    const handleReturn = async (checkoutId) => {
        try {
            await returnBook(checkoutId);
            onReturn();
        } catch (error) {
            console.error('Error returning book:', error);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Current Checkouts</h2>
            {checkouts.length === 0 ? (
                <p className="text-gray-500">You don't have any books checked out at the moment.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {checkouts.map((checkout) => (
                        <li key={checkout._id} className="py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{checkout.bookCopy.book.title}</p>
                                    <p className="text-sm text-gray-500">Due: {new Date(checkout.dueDate).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => handleReturn(checkout._id)}
                                    className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Return
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CurrentCheckouts;