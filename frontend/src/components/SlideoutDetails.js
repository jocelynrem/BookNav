import React, { useState } from 'react';
import { addBookToLibrary } from '../services/bookService';
import { ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SlideoutDetails = ({ book, bookExists, onEdit, onClose }) => {
    const [copies, setCopies] = useState(1);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const handleAddBook = () => {
        if (copies > 0 && Number.isInteger(copies)) {
            addBookToLibrary(book, copies);
        } else {
            alert('Please enter a valid number of copies.');
        }
    };

    const authorName = book.author || `${book.authorLastName || ''}, ${book.authorFirstName || ''}`.trim().replace(/^, |, $/, '');

    return (
        <div className="space-y-6 pb-16">
            <div className="flex justify-between items-center">
                <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                >
                    <XMarkIcon className="h-6 w-6" />
                    <span className="sr-only">Close panel</span>
                </button>
                {bookExists && (
                    <button
                        type="button"
                        className="flex items-center text-teal-700 hover:text-teal-900"
                        onClick={onEdit}
                    >
                        Edit book
                        <ArrowRightIcon className="ml-1 h-5 w-5" />
                    </button>
                )}
            </div>
            {book.coverImage && (
                <div className="aspect-h-3 aspect-w-3 block w-full max-w-xs mx-auto overflow-hidden rounded-lg">
                    <img
                        src={book.coverImage}
                        alt={book.title}
                        className="object-cover w-full"
                    />
                </div>
            )}
            <div className="mt-4 flex justify-between items-center">
                <div>
                    <h2 className="text-base font-semibold leading-6 text-gray-900">
                        {book.title}
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        {authorName || 'Author not available'}
                    </p>
                </div>
                {!bookExists && (
                    <div className="flex items-center">
                        <input
                            type="number"
                            value={copies}
                            onChange={(e) => setCopies(parseInt(e.target.value, 10) || 1)}
                            min="1"
                            className="mr-2 w-16 p-1 border border-gray-300 rounded-md"
                        />
                        <button
                            type="button"
                            className="text-teal-700 hover:text-teal-900"
                            onClick={handleAddBook}
                        >
                            Add<span className="sr-only">, {book.title}</span>
                        </button>
                    </div>
                )}
            </div>
            <div>
                <h3 className="font-medium text-gray-900">Information</h3>
                <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Genre</dt>
                        <dd className="text-gray-900">{book.genre}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Subject</dt>
                        <dd className="text-gray-900">{book.subject}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Published Date</dt>
                        <dd className="text-gray-900">{formatDate(book.publishedDate)}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Pages</dt>
                        <dd className="text-gray-900">{book.pages}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Copies</dt>
                        <dd className="text-gray-900">{book.copies}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">ISBN</dt>
                        <dd className="text-gray-900">{book.isbn}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default SlideoutDetails;
