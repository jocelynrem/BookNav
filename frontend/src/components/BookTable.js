import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import BookSortHeader from './BookSortHeader';
import BookDetailsSlideout from './BookDetailsSlideout';
import { updateBook } from '../services/bookService';

const BookTable = ({ books, sortedBooks, setBooks, handleDeleteBook, sortField, sortOrder, handleSortChange }) => {
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? 'asc' : 'desc';
    };

    const handleTitleClick = (book) => {
        setSelectedBook(book);
        setIsSlideoutOpen(true);
        setIsEditing(false);
    };

    const handleEditClick = (book) => {
        setSelectedBook(book);
        setIsSlideoutOpen(true);
        setIsEditing(true);
    };

    const handleSlideoutClose = () => {
        setIsSlideoutOpen(false);
        setSelectedBook(null);
    };

    const handleSave = async (updatedBook) => {
        try {
            await updateBook(updatedBook._id, updatedBook);
            // Update the book list in the state
            const updatedBooks = books.map(book =>
                book._id === updatedBook._id ? updatedBook : book
            );
            setBooks(updatedBooks);
            setIsSlideoutOpen(false);
        } catch (error) {
            console.error('Failed to update book:', error);
        }
    };

    return (
        <>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <BookSortHeader field="title" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Title" />
                                    <BookSortHeader field="author" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Author" />
                                    <BookSortHeader field="copies" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Copies" />
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
                                                        <div className="font-medium text-gray-900 cursor-pointer" onClick={() => handleTitleClick(book)}>
                                                            {String(book.title)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{String(authorName)}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{book.copies}</td>
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <a
                                                    href="#"
                                                    onClick={() => handleEditClick(book)}
                                                    className="text-teal-800 hover:text-teal-900"
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
            {selectedBook && (
                <BookDetailsSlideout
                    isOpen={isSlideoutOpen}
                    onClose={handleSlideoutClose}
                    book={selectedBook}
                    onSave={handleSave}
                    isEditing={isEditing}
                />
            )}
        </>
    );
};

export default BookTable;
