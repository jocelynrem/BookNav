import React, { useEffect, useState } from 'react';
import { getBooks, updateBook } from '../services/bookService';
import BookTable from './BookTable';
import SlideoutParent from './SlideoutParent';

const MyLibrary = () => {
    const [books, setBooks] = useState([]);
    const [editingBook, setEditingBook] = useState(null);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (err) {
            setError('Failed to fetch books');
            console.error(err);
        }
    };

    const handleUpdateBook = async (id) => {
        try {
            const updatedBook = { ...editingBook };
            await updateBook(id, updatedBook);
            setEditingBook(null);
            fetchBooks();
        } catch (err) {
            setError('Failed to update book');
            console.error(err);
        }
    };

    const handleEditClick = (book) => {
        setSelectedBook(book);
        setIsSlideoutOpen(true);
        setIsEditing(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            fetchBooks();
        }
    };

    const handleSortChange = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const sortedBooks = books
        .filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (`${book.authorLastName}, ${book.authorFirstName}`).toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = sortField === 'author' ? a.authorLastName : a[sortField];
            const bValue = sortField === 'author' ? b.authorLastName : b[sortField];
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const handleSlideoutClose = () => {
        setIsSlideoutOpen(false);
        setSelectedBook(null);
    };

    const handleSave = (updatedBook) => {
        const updatedBooks = books.map(book =>
            book._id === updatedBook._id ? updatedBook : book
        );
        setBooks(updatedBooks);
        handleSlideoutClose();
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">My Library</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage your book collection.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        className="border p-2"
                    />
                </div>
            </div>
            <BookTable
                books={books}
                sortedBooks={sortedBooks}
                setBooks={setBooks} // Pass setBooks to BookTable
                handleEditClick={handleEditClick}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSortChange={handleSortChange}
                fetchBooks={fetchBooks} // Pass fetchBooks to BookTable
            />

            {selectedBook && (
                <SlideoutParent
                    isOpen={isSlideoutOpen}
                    onClose={handleSlideoutClose}
                    book={selectedBook}
                    onSave={handleSave}
                    isEditing={isEditing}
                    fetchBooks={fetchBooks} // Pass fetchBooks to SlideoutParent
                />
            )}
        </div>
    );
};

export default MyLibrary;
