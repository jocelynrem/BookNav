import React, { useState } from 'react';

const SearchBookRow = ({ book, onAddBook, onTitleClick }) => {
    const { id, title, author, coverImage } = book || {};
    const [copies, setCopies] = useState(1);

    const handleAddBook = () => {
        if (copies > 0 && Number.isInteger(copies)) {
            onAddBook(book, copies);
        } else {
            alert('Please enter a valid number of copies.');
        }
    };

    return (
        <tr className="flex flex-col sm:table-row">
            <td className="flex flex-1 items-center py-5 pl-4 pr-3 text-sm sm:pl-6">
                {coverImage ? (
                    <div className="h-11 w-11 flex-shrink-0">
                        <img className="h-11 w-11 rounded-full" src={coverImage} alt={`${title} cover`} />
                    </div>
                ) : (
                    <div className="h-11 w-11 flex-shrink-0 bg-gray-300 rounded-full"></div>
                )}
                <div className="ml-4 flex-1 min-w-0">
                    <div
                        className="font-medium text-gray-800 cursor-pointer truncate hover:text-gray-900 hover:underline transition-all"
                        onClick={() => onTitleClick(book)}
                        title="Click to view more details"
                    >
                        {title || 'Unknown Title'}
                    </div>
                    <div className="mt-1 text-gray-500 truncate">{author || 'Unknown Author'}</div>
                </div>
            </td>
            <td className="flex items-center py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <input
                    type="number"
                    value={copies}
                    onChange={(e) => setCopies(parseInt(e.target.value, 10) || 1)} // Ensure copies is an integer
                    min="1"
                    className="mr-2 w-16 p-1 border border-gray-300 rounded-md"
                />
                <button
                    type="button"
                    className="text-teal-700 hover:text-teal-900"
                    onClick={handleAddBook}
                >
                    Add<span className="sr-only">, {title}</span>
                </button>
            </td>
        </tr>
    );
};

export default SearchBookRow;
