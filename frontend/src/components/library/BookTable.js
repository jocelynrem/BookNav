import React, { useState } from 'react';
import BookSortHeader from './BookSortHeader';
import SlideoutParent from '../slideout/SlideoutParent';
import { updateBook } from '../../services/bookService';

const BookTable = ({ books, sortedBooks, setBooks, sortField, sortOrder, handleSortChange, fetchBooks }) => {
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

    const handleEditClickInternal = (book) => {
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
                                    <BookSortHeader field="copies" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Copies" className="w-16 hidden sm:table-cell" />
                                    <th scope="col" className="relative w-12 py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {sortedBooks.map((book) => {
                                    const authorNameMobile = book.authorLastName;
                                    const authorNameFull = `${book.authorLastName}, ${book.authorFirstName}`;
                                    return (
                                        <tr key={book._id}>
                                            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0 max-w-[200px] sm:max-w-[250px] truncate">
                                                <div className="flex items-center">
                                                    {/* {book.coverImage && (
                                                        <div className="h-11 w-11 flex-shrink-0">
                                                            <img className="h-11 w-11 rounded-full" src={book.coverImage} alt="" />
                                                        </div>
                                                    )} */}
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900 cursor-pointer truncate" onClick={() => handleTitleClick(book)}>
                                                            {String(book.title)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 max-w-[150px] sm:max-w-[300px] truncate">
                                                <span className="block sm:hidden">{String(authorNameMobile)}</span>
                                                <span className="hidden sm:block">{String(authorNameFull)}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 w-16 hidden sm:table-cell">{book.copies}</td>
                                            <td className="relative w-12 whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <a
                                                    href="#"
                                                    onClick={() => handleEditClickInternal(book)}
                                                    className="text-teal-800 hover:text-teal-900"
                                                >
                                                    Edit<span className="sr-only">, {book.title}</span>
                                                </a>
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
                <SlideoutParent
                    isOpen={isSlideoutOpen}
                    onClose={handleSlideoutClose}
                    book={selectedBook}
                    onSave={handleSave}
                    isEditing={isEditing}
                    fetchBooks={fetchBooks}
                />
            )}
        </>
    );
};

export default BookTable;
