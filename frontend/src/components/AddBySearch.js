import React, { useState } from 'react';
import { fetchBooksByTitle, fetchBooksByAuthor, addBookToLibrary, fetchLibraryBooks, updateBookCopies } from '../services/bookService';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import SearchBookTable from './SearchBookTable';
import BookDetailsSlideout from './BookDetailsSlideout';
import BookSearch from './BookSearch';

const AddBySearch = () => {
    const [searchType, setSearchType] = useState('title');
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = searchType === 'title'
                ? await fetchBooksByTitle(query)
                : await fetchBooksByAuthor(query);
            setBooks(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch books');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setLimit((prevLimit) => prevLimit + 10);
    };

    const handleTitleClick = (book) => {
        setSelectedBook(book);
        setIsSlideoutOpen(true);
    };

    const handleSlideoutClose = () => {
        setIsSlideoutOpen(false);
        setSelectedBook(null);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium text-gray-900">Search Book</h2>
            <BookSearch
                query={query}
                handleChange={handleChange}
                handleSearchTypeChange={handleSearchTypeChange}
                handleSearch={handleSearch}
                searchType={searchType}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {loading && (
                <div className="mt-4 text-center">
                    <ClipLoader size={35} color={"#4A90E2"} loading={loading} />
                </div>
            )}
            {books.length > 0 && !loading && (
                <div className="mt-8 flow-root">
                    <SearchBookTable
                        books={books.slice(0, limit)}
                        onAddBook={addBookToLibrary}
                        onTitleClick={handleTitleClick}
                    />
                    {books.length > limit && (
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={loadMore}
                                className="text-indigo-600 hover:text-indigo-900"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            )}
            {selectedBook && (
                <BookDetailsSlideout
                    isOpen={isSlideoutOpen}
                    onClose={handleSlideoutClose}
                    book={selectedBook}
                />
            )}
        </div>
    );
};

export default AddBySearch;
