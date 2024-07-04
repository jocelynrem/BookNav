import React, { useEffect, useState } from 'react';
import { getBooks, updateBook } from '../services/bookService';
import BookTable from '../components/library/BookTable';
import SlideoutParent from '../components/slideout/SlideoutParent';
import { Link } from 'react-router-dom';

const MyLibrary = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setIsLoading(true);
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (err) {
            setError('Failed to fetch books');
            console.error(err);
        } finally {
            setIsLoading(false);
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            {isLoading ? (
                <p className="mt-4 text-center text-gray-500">Loading your library...</p>
            ) : books.length === 0 ? (
                <div className="mt-4 text-center">
                    <p className="text-gray-500">Your library is empty. Start adding books to your collection!</p>
                    <Link to="/add-search" className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Add Books
                    </Link>
                </div>
            ) : sortedBooks.length === 0 ? (
                <p className="mt-4 text-center text-gray-500">No books match your search. Try a different query.</p>
            ) : (
                <BookTable
                    books={books}
                    sortedBooks={sortedBooks}
                    setBooks={setBooks}
                    handleEditClick={handleEditClick}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    handleSortChange={handleSortChange}
                    fetchBooks={fetchBooks}
                />
            )}

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
        </div>
    );
};

export default MyLibrary;
