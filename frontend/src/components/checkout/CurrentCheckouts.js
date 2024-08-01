import React from 'react';
import { returnBook } from '../../services/checkoutService';

const CurrentCheckouts = ({ checkouts, onReturn }) => {
    const handleReturn = async (checkoutId) => {
        try {
            await returnBook(checkoutId);
            onReturn(); // Fetch the updated list of checkouts
        } catch (error) {
            console.error('Error returning book:', error);
            alert('Failed to return book. Please try again.');
        }
    };

    if (!Array.isArray(checkouts)) {
        return <p>No current checkouts or loading...</p>;
    }

    return (
        <div className="bg-white shadow rounded-lg p-4 sm:p-5">
            <h2 className="text-md font-semibold text-gray-900 mb-3">Current Checkouts</h2>
            {checkouts.length === 0 ? (
                <p className="text-sm text-gray-500">No books currently checked out.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {checkouts.map((checkout) => (
                        <li key={checkout._id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {checkout.book ? checkout.book.title : 'Unknown Title'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Due: {checkout.dueDate ? new Date(checkout.dueDate).toLocaleDateString() : 'Unknown Date'}
                                </p>
                            </div>
                            <button
                                onClick={() => handleReturn(checkout._id)}
                                className="ml-2 sm:ml-4 inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                Return
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CurrentCheckouts;