import React, { useState } from 'react';
import { fetchBooksByTitle, fetchBooksByAuthor, createBook, fetchLibraryBooks, updateBookCopies } from '../services/bookService';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import SearchBookTable from './SearchBookTable';
import BookDetailsSlideout from './BookDetailsSlideout';

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

    const addBookToLibrary = async (book, copies) => {
        const [authorFirstName, authorLastName] = (book.author || '').split(' ', 2);
        const bookData = {
            title: book.title || 'Unknown Title',
            authorFirstName: authorFirstName || 'Unknown',
            authorLastName: authorLastName || 'Unknown',
            publishedDate: book.publishedDate || '',
            pages: book.pages || 0,
            genre: book.genre || 'Unknown',
            subject: book.subject || 'Unknown', // Ensure subject is included
            coverImage: book.coverImage || '',
            isbn: book.isbn || 'N/A',
            copies: parseInt(copies, 10) || 1 // Ensure copies is a number
        };

        try {
            const existingBooks = await fetchLibraryBooks();
            const existingBook = existingBooks.find(b =>
                b.title.toLowerCase() === book.title.toLowerCase() &&
                b.authorFirstName.toLowerCase() === authorFirstName.toLowerCase() &&
                b.authorLastName.toLowerCase() === authorLastName.toLowerCase()
            );

            if (existingBook) {
                const { value: numberOfCopies } = await Swal.fire({
                    title: `The book "${book.title}" by ${book.author} already exists in the library.`,
                    text: "How many additional copies would you like to add?",
                    icon: 'warning',
                    input: 'number',
                    inputAttributes: {
                        min: 1,
                        step: 1,
                        value: 1
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Add Copies',
                    cancelButtonText: 'Cancel'
                });

                if (numberOfCopies && numberOfCopies > 0) {
                    await updateBookCopies(existingBook._id, parseInt(existingBook.copies, 10) + parseInt(numberOfCopies, 10));
                    Swal.fire(`${numberOfCopies} copies of ${book.title} added to the library!`);
                }
            } else {
                await createBook(bookData);
                showAddConfirmation(book.title);
            }
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
                    <SearchBookTable
                        books={books.slice(0, limit)}
                        onAddBook={addBookToLibrary}
                        onTitleClick={handleTitleClick} // Pass title click handler
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
