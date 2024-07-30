//frontend/src/components/slideout/BookDetails.js
import React from 'react';
import { PlusCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const BookDetails = ({ book, bookExists, onEdit, onClose, setNotification, setDialog, setUndoBook, setUserBooks }) => {
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

    return (
        <div className="space-y-6 pb-16">
            <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold leading-6 text-gray-900">
                    {book.title}
                </h2>
            </div>
            <div className="flex justify-between items-center">
                <button
                    type="button"
                    className="flex items-center text-teal-700 hover:text-teal-900"
                    onClick={() => onEdit()}
                >
                    Edit book
                    <ArrowRightIcon className="ml-1 h-5 w-5" />
                </button>
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
                    {/* {renderField("Available Copies", book.availableCopies, "availableCopies")} */}
                    {renderField("ISBN", book.isbn, "isbn")}
                    {renderField("Reading Level", book.readingLevel, "readingLevel")}
                    {renderField("Lexile Score", book.lexileScore, "lexileScore")}
                    {renderField("AR Points", book.arPoints, "arPoints")}
                </dl>
            </div>
        </div>
    );
};

export default BookDetails;