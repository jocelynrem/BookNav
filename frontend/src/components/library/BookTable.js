import React, { useState } from 'react';
import BookSortHeader from './BookSortHeader';
import SlideoutParent from '../slideout/SlideoutParent';
import BookDetails from '../slideout/BookDetails';
import BookEdit from '../slideout/BookEdit';
import { updateBook } from '../../services/bookService';
import Pagination from '../Pagination';

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
                <div className="overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <BookSortHeader
                                    field="title"
                                    handleSortChange={handleSortChange}
                                    getSortIcon={getSortIcon}
                                    label="Title"
                                />
                                <BookSortHeader field="author" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Author" />
                                <BookSortHeader field="copies" handleSortChange={handleSortChange} getSortIcon={getSortIcon} label="Copies" className="hidden sm:table-cell" />
                                <th scope="col" className="relative w-12 py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {currentBooks.map((book) => (
                                <tr key={book._id}>
                                    <td className="whitespace-nowrap py-5 pr-3 text-sm sm:pl-0 truncate max-w-[150px] sm:max-w-[250px]">
                                        <div className="flex items-center">
                                            <div className="ml-4 truncate">
                                                <div className="font-medium cursor-pointer truncate text-teal-900 hover:text-teal-800 hover:underline transition-all duration-200 rounded px-1 -mx-1" onClick={() => handleTitleClick(book)}>
                                                    {String(book.title)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
                                        <div className="truncate">{getAuthorName(book)}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 hidden sm:table-cell">
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

export default BookTable;
