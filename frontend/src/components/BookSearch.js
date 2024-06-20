import React from 'react';

const BookSearch = ({ searchQuery, handleSearchChange }) => {
    return (
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="border p-2"
            />
        </div>
    );
};

export default BookSearch;
