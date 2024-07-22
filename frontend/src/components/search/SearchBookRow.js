// frontend/src/components/search/SearchBookRow.js
import React, { useState } from 'react';

const SearchBookRow = ({ book, userBooks, setUserBooks, onAddBook, onTitleClick }) => {
    const title = book.title || 'Unknown Title';
    const author = book.author || 'Unknown Author';
    const coverImage = book.thumbnail || '';

    const [copies, setCopies] = useState(1);

    const isInLibrary = userBooks.some(userBook => {
        const userBookTitle = userBook.title && userBook.title.toLowerCase();
        const bookTitle = title && title.toLowerCase();
        const userBookAuthor = userBook.author && userBook.author.toLowerCase();
        const bookAuthor = author && author.toLowerCase();

        // Check for exact title and author match
        const isTitleMatch = userBookTitle === bookTitle;
        const isAuthorMatch = userBookAuthor === bookAuthor;

        // Additional checks for ISBN or other metadata if available
        const isISBNMatch = userBook.isbn === book.isbn;

        // Return true if any exact match is found, considering available metadata
        return isTitleMatch && isAuthorMatch && (isISBNMatch || (!userBook.isbn && !book.isbn));
    });



    const handleAddBook = async () => {
        if (copies > 0 && Number.isInteger(copies)) {
            const formattedBook = {
                ...book,
                author: author,
                copies
            };
            const addedBook = await onAddBook(formattedBook, copies);
            if (addedBook) {
                setUserBooks(prevBooks => [
                    ...prevBooks,
                    {
                        ...book,
                        copies,
                        _id: addedBook._id
                    }
                ]);
            }
        } else {
            alert('Please enter a valid number of copies.');
        }
    };

    return (
        <tr key={book.id} className="sm:table-row">
            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0 max-w-[200px] sm:max-w-[250px] truncate">
                <div className="flex items-center">
                    {coverImage ? (
                        <div className="h-11 w-11 flex-shrink-0">
                            <img className="h-11 w-11 rounded-full" src={coverImage} alt={`${title} cover`} />
                        </div>
                    ) : (
                        <div className="h-11 w-11 flex-shrink-0 bg-gray-300 rounded-full"></div>
                    )}
                    <div className="ml-4 flex-1 min-w-0">
                        <div
                            className="font-medium text-teal-900 hover:text-teal-800 cursor-pointer truncate hover:underline transition-all"
                            onClick={() => onTitleClick(book)}
                            title="Click to view more details"
                        >
                            {title}
                        </div>
                        <div className="mt-1 text-gray-500 truncate">{author}</div>
                        {isInLibrary && (
                            <div className="mt-1 text-pink-600">This book is in your library</div>
                        )}
                    </div>
                </div>
            </td>
            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pr-6 flex sm:table-cell sm:justify-end">
                <div className="flex flex-col sm:flex-row items-center sm:justify-end w-full sm:w-auto">
                    <input
                        type="number"
                        value={copies}
                        onChange={(e) => setCopies(parseInt(e.target.value, 10) || 1)}
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
                </div>
            </td>
        </tr>
    );
};

export default SearchBookRow;
