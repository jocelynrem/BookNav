import React, { useState } from 'react';

const BookSearch = ({ query, handleChange, handleSearchTypeChange, handleSearch, searchType, handleScanToggle, scanning }) => {
    const [error, setError] = useState(null);

    const handleSearchClick = async () => {
        try {
            setError(null);
            await handleSearch();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
            <select
                value={searchType}
                onChange={handleSearchTypeChange}
                className="block w-full sm:w-1/6 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-700 sm:text-sm sm:leading-6"
            >
                <option value="isbn">ISBN</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
            </select>
            <input
                type="text"
                name="query"
                id="query"
                value={query}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder={`Enter Book ${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`}
                className="block w-full sm:flex-grow rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-700 sm:text-sm sm:leading-6"
            />
            <div className="flex gap-2 sm:gap-1 flex-shrink-0">
                <button
                    type="button"
                    onClick={handleSearchClick}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-800 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700"
                >
                    Search
                </button>
                {searchType === 'isbn' && (
                    <button
                        type="button"
                        onClick={handleScanToggle}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-700 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 whitespace-nowrap"
                    >
                        {scanning ? 'Stop Scanning' : 'Scan ISBN'}
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default BookSearch;
