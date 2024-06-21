import React from 'react';

const BookSearch = ({ query, handleChange, handleSearchTypeChange, handleSearch, searchType }) => {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <select
                value={searchType}
                onChange={handleSearchTypeChange}
                className="block w-full sm:w-1/4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-700 sm:text-sm sm:leading-6"
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
                onKeyPress={handleKeyPress}
                placeholder={`Enter Book ${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`}
                className="block w-full sm:flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-700 sm:text-sm sm:leading-6"
            />
            <button
                type="button"
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-800 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700"
            >
                Search
            </button>
        </div>
    );
};

export default BookSearch;
