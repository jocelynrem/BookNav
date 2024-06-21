import React, { useState } from 'react';
import { fetchBookByISBN } from '../services/bookService';

const AddBookISBN = () => {
    const [isbn, setIsbn] = useState('');
    const [bookData, setBookData] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setIsbn(e.target.value);
    };

    const handleSearch = async () => {
        try {
            const data = await fetchBookByISBN(isbn);
            setBookData(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch book details');
            console.error(err);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Add Book by ISBN</h2>
            <div className="mt-4">
                <input
                    type="text"
                    name="isbn"
                    id="isbn"
                    value={isbn}
                    onChange={handleChange}
                    placeholder="Enter ISBN"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    Search
                </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {bookData && (
                <div className="mt-4">
                    <h3 className="text-md font-semibold text-gray-900">{bookData.title}</h3>
                    <p className="text-sm text-gray-700">{bookData.author}</p>
                    {/* Add more book details here */}
                </div>
            )}
        </div>
    );
};

export default AddBookISBN;
