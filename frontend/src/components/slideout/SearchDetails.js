import React, { useState } from 'react';
import { PlusCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const SearchDetails = ({ book, userBooks, onEdit, onClose, setNotification, setDialog, setUndoBook, setUserBooks, onAddBook }) => {
    const [copiesToAdd, setCopiesToAdd] = useState(1);

    const getAuthorName = (book) => {
        if (book.author) return book.author;
        return `${book.authorFirstName || ''} ${book.authorLastName || ''}`.trim();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const renderField = (label, value, fieldName) => (
        <div className="flex justify-between py-3 text-sm font-medium">
            <dt className="text-gray-500">{label}</dt>
            <dd className="text-gray-900 flex items-center">
                {value || (
                    <button
                        onClick={() => onEdit()}
                        className="text-teal-700 hover:text-teal-900 flex items-center"
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-1" />
                        Add
                    </button>
                )}
            </dd>
        </div>
    );

    const isBookInLibrary = userBooks.some(userBook =>
        userBook.isbn === book.isbn ||
        (userBook.title.toLowerCase() === book.title.toLowerCase() &&
            getAuthorName(userBook).toLowerCase() === getAuthorName(book).toLowerCase())
    );

    const handleAddBook = () => {
        onAddBook(book, copiesToAdd, isBookInLibrary);
        onClose();
    };

    return (
        <div className="space-y-6 pb-16">
            <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold leading-6 text-gray-900">
                    {book.title}
                </h2>
            </div>
            <div className="space-y-4">
                {isBookInLibrary && (
                    <p className="text-sm text-teal-600 font-medium">
                        This book is already in your library.
                    </p>
                )}
                <div className="flex items-center space-x-2">
                    <label htmlFor="copies" className="text-sm text-gray-700">Copies:</label>
                    <input
                        id="copies"
                        type="number"
                        min="1"
                        value={copiesToAdd}
                        onChange={(e) => setCopiesToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                    <button
                        onClick={handleAddBook}
                        className="flex-grow inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        {isBookInLibrary ? 'Add Copies' : 'Add to Library'}
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    {isBookInLibrary
                        ? `Adding ${copiesToAdd} ${copiesToAdd === 1 ? 'copy' : 'copies'} to your existing collection.`
                        : `Adding ${copiesToAdd} ${copiesToAdd === 1 ? 'copy' : 'copies'} to your library.`
                    }
                </p>
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
            <div>
                <h3 className="font-medium text-gray-900">Information</h3>
                <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                    {renderField("Author", getAuthorName(book), "author")}
                    {renderField("Genre", book.genre, "genre")}
                    {renderField("Subject", book.subject, "subject")}
                    {renderField("Published Date", formatDate(book.publishedDate), "publishedDate")}
                    {renderField("Pages", book.pages, "pages")}
                    {renderField("Total Copies", book.copies, "copies")}
                    {renderField("ISBN", book.isbn, "isbn")}
                </dl>
            </div>
        </div>
    );
};

export default SearchDetails;