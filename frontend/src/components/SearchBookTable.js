import React from 'react';
import SearchBookRow from './SearchBookRow';

const SearchBookTable = ({ books, onAddBook }) => {
    return (
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {books.map((book) => (
                                <SearchBookRow key={book.id} book={book} onAddBook={onAddBook} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SearchBookTable;
