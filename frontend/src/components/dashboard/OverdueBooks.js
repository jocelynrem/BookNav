import React from 'react';

const OverdueBooks = ({ overdueBooks }) => {
    return (
        <div className="bg-white shadow rounded-lg flex flex-col h-full w-full">
            <div className="px-4 py-2 sm:p-2">
                <h3 className="text-md leading-6 font-medium text-gray-900">Overdue Books</h3>
            </div>
            <div className="px-4 py-2 sm:p-2 overflow-y-auto flex-1">
                {overdueBooks.length === 0 ? (
                    <p className="text-sm text-gray-600">No overdue books! 🎉</p>
                ) : (
                    <ul className="mt-1 divide-y divide-gray-200">
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
