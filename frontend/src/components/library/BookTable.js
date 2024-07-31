import React, { useState } from 'react';
import BookSortHeader from './BookSortHeader';
import SlideoutParent from '../slideout/SlideoutParent';
import BookDetails from '../slideout/BookDetails';
import BookEdit from '../slideout/BookEdit';
import { updateBook } from '../../services/bookService';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const BookTable = ({ books, sortedBooks, setBooks, sortField, sortOrder, handleSortChange, fetchBooks }) => {
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', error: false, undo: false });
    const [dialog, setDialog] = useState({ open: false, title: '', content: '', onConfirm: () => { } });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const getAuthorName = (book) => {
        if (book.author) return book.author;
        return `${book.authorFirstName || ''} ${book.authorLastName || ''}`.trim();
    };

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
            const updatedBooks = books.map(book =>
                book._id === updatedBook._id ? updatedBook : book
            );
            setBooks(updatedBooks);
            setIsSlideoutOpen(false);
        } catch (error) {
            console.error('Failed to update book:', error);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
    const currentBooks = sortedBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <BookSortHeader
                                        field="title"
                                        handleSortChange={handleSortChange}
                                        getSortIcon={getSortIcon}
                                        label="Title"
                                    />
                                    <BookSortHeader field="author" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Author" />
                                    <BookSortHeader field="copies" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Copies" className="w-16 hidden sm:table-cell" />
                                    <th scope="col" className="relative w-12 py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentBooks.map((book) => (
                                    <tr key={book._id}>
                                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0 max-w-[200px] sm:max-w-[250px] truncate">
                                            <div className="flex items-center">
                                                <div className="ml-4">
                                                    <div className="font-medium cursor-pointer truncate text-teal-900 hover:text-teal-800 hover:underline transition-all duration-200 rounded px-1 -mx-1" onClick={() => handleTitleClick(book)}>
                                                        {String(book.title)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 max-w-[150px] sm:max-w-[300px] truncate">
                                            {getAuthorName(book)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 w-16 hidden sm:table-cell">
                                            {book.copies}
                                        </td>
                                        <td className="relative w-12 whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                            <button
                                                onClick={() => handleEditClick(book)}
                                                className="text-teal-800 hover:text-teal-900"
                                            >
                                                Edit<span className="sr-only">, {book.title}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedBooks.length > itemsPerPage && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={sortedBooks.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </div>
            <SlideoutParent
                isOpen={isSlideoutOpen}
                onClose={handleSlideoutClose}
                title={isEditing ? 'Edit Book' : 'Book Details'}
                notification={notification}
                setNotification={setNotification}
                dialog={dialog}
                setDialog={setDialog}
            >
                {selectedBook && (
                    isEditing ? (
                        <BookEdit
                            book={selectedBook}
                            onSave={handleSave}
                            onClose={handleSlideoutClose}
                            fetchBooks={fetchBooks}
                            onView={() => setIsEditing(false)}
                        />
                    ) : (
                        <BookDetails
                            book={selectedBook}
                            onEdit={() => setIsEditing(true)}
                            onClose={handleSlideoutClose}
                            setNotification={setNotification}
                            setDialog={setDialog}
                            setBooks={setBooks}
                        />
                    )
                )}
            </SlideoutParent>
        </>
    );
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                        <span className="font-medium">{totalItems}</span> results
                    </p>
                </div>
                <div>
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                        {[...Array(totalPages).keys()].map(page => (
                            <button
                                key={page + 1}
                                onClick={() => onPageChange(page + 1)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page + 1 ? 'bg-pink-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                            >
                                {page + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default BookTable;
