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
        <div className="mt-4 flex flex-col">
            <h2 className="text-lg font-medium text-gray-900 sm:hidden mb-4">Search by:</h2>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
                <h2 className="text-lg font-medium text-gray-900 hidden sm:block">Search by:</h2>
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="isbn"
                        name="searchType"
                        value="isbn"
                        checked={searchType === 'isbn'}
                        onChange={handleSearchTypeChange}
                        className="mr-2 text-pink-700 focus:ring-pink-500"
                    />
                    <label htmlFor="isbn" className={`mr-4 ${searchType === 'isbn' ? 'text-pink-700' : ''}`}>ISBN</label>
                </div>
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="title"
                        name="searchType"
                        value="title"
                        checked={searchType === 'title'}
                        onChange={handleSearchTypeChange}
                        className="mr-2 text-pink-700 focus:ring-pink-500"
                    />
                    <label htmlFor="title" className={`mr-4 ${searchType === 'title' ? 'text-pink-700' : ''}`}>Title</label>
                </div>
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="author"
                        name="searchType"
                        value="author"
                        checked={searchType === 'author'}
                        onChange={handleSearchTypeChange}
                        className="mr-2 text-pink-700 focus:ring-pink-500"
                    />
                    <label htmlFor="author" className={`${searchType === 'author' ? 'text-pink-700' : ''}`}>Author</label>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                <input
                    type="text"
                    name="query"
                    id="query"
                    value={query}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder={`Enter Book ${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-700 sm:text-sm sm:leading-6"
                />
                <button
                    type="button"
                    onClick={handleSearchClick}
                    className="w-full sm:w-auto sm:px-6 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-800 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 mt-2 sm:mt-0"
                >
                    Search
                </button>
                {searchType === 'isbn' && (
                    <button
                        type="button"
                        onClick={handleScanToggle}
                        className="w-full sm:w-auto sm:px-6 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-700 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-700 whitespace-nowrap mt-2 sm:mt-0"
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
