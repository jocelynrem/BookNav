import React, { useState } from 'react';
import { fetchBooksByTitle, fetchBooksByAuthor, createBook } from '../services/bookService';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';

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

    const addBookToLibrary = async (book) => {
        const [authorFirstName, authorLastName] = book.author.split(' ', 2);
        const bookData = {
            title: book.title,
            authorFirstName: authorFirstName || 'Unknown',
            authorLastName: authorLastName || 'Unknown',
            publishedDate: book.publishedDate || '',
            pages: book.pages || 0,
            genre: book.genre || 'Unknown',
            coverImage: book.coverImage || '',
            isbn: book.isbn || 'N/A' // Include ISBN if needed
        };

        console.log('Book data being sent:', bookData); // Log data for debugging

        try {
            await createBook(bookData);
            showToast(`Book "${book.title}" added to the library!`);
        } catch (err) {
            console.error('Failed to add book:', err);
            showToast('Failed to add book.', 'error');
        }
    };



    const showToast = (title, icon = 'success') => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: title,
            showConfirmButton: false,
            timer: 3000,
            customClass: {
                popup: 'bg-white shadow-lg rounded-md text-black',
            },
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
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {books.slice(0, limit).map((book) => (
                                            <tr key={book.id}>
                                                <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="flex items-center">
                                                        {book.coverImage ? (
                                                            <div className="h-11 w-11 flex-shrink-0">
                                                                <img className="h-11 w-11 rounded-full" src={book.coverImage} alt="" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-11 w-11 flex-shrink-0 bg-gray-300 rounded-full"></div>
                                                        )}
                                                        <div className="ml-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                                                            <div className="font-medium text-gray-900 truncate">{book.title}</div>
                                                            <div className="mt-1 text-gray-500 truncate">{book.author}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        type="button"
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        onClick={() => addBookToLibrary(book)}
                                                    >
                                                        Add<span className="sr-only">, {book.title}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddBySearch;
