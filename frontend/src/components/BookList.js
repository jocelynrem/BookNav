import React, { useEffect, useState } from 'react';
import { getBooks, createBook, updateBook, deleteBook } from '../services/bookService';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [newBook, setNewBook] = useState({ title: '', author: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (err) {
            setError('Failed to fetch books');
            console.error(err);
        }
    };

    const handleCreateBook = async () => {
        try {
            await createBook(newBook);
            setNewBook({ title: '', author: '' });
            fetchBooks();
        } catch (err) {
            setError('Failed to create book');
            console.error(err);
        }
    };

    const handleUpdateBook = async (id) => {
        try {
            const updatedBook = { ...books.find(book => book._id === id), title: 'Updated Title' }; // Example update
            await updateBook(id, updatedBook);
            fetchBooks();
        } catch (err) {
            setError('Failed to update book');
            console.error(err);
        }
    };

    const handleDeleteBook = async (id) => {
        try {
            await deleteBook(id);
            fetchBooks();
        } catch (err) {
            setError('Failed to delete book');
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Book List</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                placeholder="Title"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
            <input
                type="text"
                placeholder="Author"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
            <button onClick={handleCreateBook}>Add Book</button>
            <ul>
                {books.map((book) => (
                    <li key={book._id}>
                        {book.title} by {book.author}
                        <button onClick={() => handleUpdateBook(book._id)}>Update</button>
                        <button onClick={() => handleDeleteBook(book._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BookList;
