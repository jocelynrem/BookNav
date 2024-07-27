import React from 'react';

const OverdueBooks = ({ overdueBooks }) => {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Overdue Books</h3>
                {overdueBooks.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600">No overdue books! 🎉</p>
                ) : (
                    <ul className="mt-3 divide-y divide-gray-200">
                        {overdueBooks.map((book) => (
                            <li key={book._id} className="py-3">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {book.student.firstName} {book.student.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">{book.bookCopy.book.title}</p>
                                    </div>
                                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                        {book.daysOverdue} days overdue
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default OverdueBooks;