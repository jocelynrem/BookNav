import React, { useEffect, useState } from 'react';
import { getBooks, createBook, updateBook, deleteBook } from '../services/bookService';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [newBook, setNewBook] = useState({ title: '', author: '' });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        const data = await getBooks();
        setBooks(data);
    };

    const handleCreateBook = async () => {
        await createBook(newBook);
        setNewBook({ title: '', author: '' });
        fetchBooks();
    };

    const handleUpdateBook = async (id) => {
        const updatedBook = { ...books.find(book => book._id === id), title: 'Updated Title' }; // Example update
        await updateBook(id, updatedBook);
        fetchBooks();
    };

    const handleDeleteBook = async (id) => {
        await deleteBook(id);
        fetchBooks();
    };

    return (
        <div>
            <h1>Book List</h1>
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
