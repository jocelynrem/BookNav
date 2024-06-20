import React from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import BookSortHeader from './BookSortHeader';

const BookTable = ({ books, sortedBooks, handleEditClick, handleDeleteBook, getCopyStatus, sortField, sortOrder, handleSortChange }) => {
    const hasCheckedOutBooks = books.some(book => getCopyStatus(book.copies).checkedOut > 0);

    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? 'asc' : 'desc';
    };

    return (
        <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                                <BookSortHeader field="title" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Title" />
                                <BookSortHeader field="author" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Author" />
                                <BookSortHeader field="inLibrary" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Copies" />
                                {hasCheckedOutBooks && (
                                    <BookSortHeader field="checkedOut" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Checked Out" />
                                )}
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Edit</span>
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Delete</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {sortedBooks.map((book) => {
                                const { inLibrary, checkedOut } = getCopyStatus(book.copies);
                                const authorName = `${book.authorLastName}, ${book.authorFirstName}`;
                                return (
                                    <tr key={book._id}>
                                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                            <div className="flex items-center">
                                                {book.coverImage && (
                                                    <div className="h-11 w-11 flex-shrink-0">
                                                        <img className="h-11 w-11 rounded-full" src={book.coverImage} alt="" />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{book.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{authorName}</td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{inLibrary}</td>
                                        {checkedOut > 0 && (
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{checkedOut}</td>
                                        )}
                                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                            <a
                                                href="#"
                                                onClick={() => handleEditClick(book)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit<span className="sr-only">, {book.title}</span>
                                            </a>
                                        </td>
                                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                            <button
                                                onClick={() => handleDeleteBook(book._id, book.title)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                                <span className="sr-only">, {book.title}</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookTable;
