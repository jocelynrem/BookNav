import React, { useState } from 'react';
import { fetchBooksByTitle, fetchBooksByAuthor, createBook } from '../services/bookService';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import SearchBookTable from './SearchBookTable';

const AddBySearch = () => {
    const [searchType, setSearchType] = useState('title');
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);

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

    const addBookToLibrary = async (book, copies) => {
        const [authorFirstName, authorLastName] = (book.author || '').split(' ', 2);
        const bookData = {
            title: book.title || 'Unknown Title',
            authorFirstName: authorFirstName || 'Unknown',
            authorLastName: authorLastName || 'Unknown',
            publishedDate: book.publishedDate || '',
            pages: book.pages || 0,
            genre: book.genre || 'Unknown',
            coverImage: book.coverImage || '',
            isbn: book.isbn || 'N/A',
            copies: copies || 1 // default to 1 copy if not specified
        };

        try {
            // Create a new book in the library
            await createBook(bookData);
            showAddConfirmation(book.title);
        } catch (err) {
            console.error('Failed to add book:', err);
            Swal.fire('Error', 'Failed to add book.', 'error');
        }
    };

    const showAddConfirmation = (title) => {
        Swal.fire({
            title: `${title} added to library!`,
            position: 'bottom-end',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium text-gray-900">Search Book</h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <select
                    value={searchType}
                    onChange={handleSearchTypeChange}
                    className="block w-full sm:w-1/4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                </select>
                <input
                    type="text"
                    name="query"
                    id="query"
                    value={query}
                    onChange={handleChange}
                    placeholder={`Enter Book ${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`}
                    className="block w-full sm:flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Search
                </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {loading && (
                <div className="mt-4 text-center">
                    <ClipLoader size={35} color={"#4A90E2"} loading={loading} />
                </div>
            )}
            {books.length > 0 && !loading && (
                <div className="mt-8 flow-root">
                    <SearchBookTable books={books.slice(0, limit)} onAddBook={addBookToLibrary} />
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
        </div>
    );
};

export default AddBySearch;
