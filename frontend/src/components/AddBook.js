import React, { useState } from 'react';
import { createBook } from '../services/bookService';

const AddBook = () => {
    const [newBook, setNewBook] = useState({ title: '', author: '' });
    const [error, setError] = useState('');

    const handleCreateBook = async () => {
        try {
            await createBook({ ...newBook, copies: [{ status: 'in library' }] });
            setNewBook({ title: '', author: '' });
        } catch (err) {
            setError('Failed to create book');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-semibold mb-4">Add New Book</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div>
                <input
                    type="text"
                    placeholder="Title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="border p-2 mb-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Author"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="border p-2 mb-2"
                />
            </div>
            <button
                onClick={handleCreateBook}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md"
            >
                Add Book
            </button>
        </div>
    );
};

export default AddBook;
