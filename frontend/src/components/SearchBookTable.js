import React from 'react';
import SearchBookRow from './SearchBookRow';

const SearchBookTable = ({ books, userBooks, setUserBooks, onAddBook, onTitleClick }) => {
    return (
        <div className="overflow-x-auto">
            <div className="min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {books.map((book) => (
                                <SearchBookRow
                                    key={book.id}
                                    book={book}
                                    onAddBook={onAddBook}
                                    onTitleClick={onTitleClick}
                                    userBooks={userBooks}
                                    setUserBooks={setUserBooks}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SearchBookTable;
