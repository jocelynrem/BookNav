import React, { useState } from 'react';
import { createBook, getBooks } from '../services/bookService';
import { useNavigate } from 'react-router-dom';

const AddBookManual = () => {
    const [book, setBook] = useState({
        title: '',
        authorFirstName: '',
        authorLastName: '',
        isbn: '',
        publishedDate: '',
        genre: '',
        coverImage: '',
        pages: '',
        copies: 1
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBook(prevBook => ({
            ...prevBook,
            [name]: value
        }));
        // Clear field-specific error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!book.title.trim()) errors.title = 'Title is required';
        if (!book.authorLastName.trim()) errors.authorLastName = 'Author last name is required';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setError('Please fill in all required fields.');
            return;
        }
        try {
            const createdBook = await createBook(book);
            console.log('Book created:', createdBook);
            setSuccess('Book added successfully!');
            setError('');

            // Fetch updated library
            try {
                await getBooks();
                console.log('Library updated');
            } catch (fetchError) {
                console.error('Error fetching updated library:', fetchError);
            }

            // Navigate to home after a short delay
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error('Error adding book:', err);
            setError('Failed to add book. ' + (err.message || 'Unknown error'));
            setSuccess('');
        }
    };

    const RequiredFieldLabel = ({ children }) => (
        <span className="flex items-center">
            {children}
            <span className="text-red-500 ml-1">*</span>
        </span>
    );

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Add a New Book</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <p className="text-sm text-gray-500 mb-4">Fields marked with an asterisk (*) are required.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        <RequiredFieldLabel>Title</RequiredFieldLabel>
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={book.title}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 ${fieldErrors.title ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.title && <p className="mt-1 text-sm text-red-500">{fieldErrors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="authorFirstName" className="block text-sm font-medium text-gray-700">
                            Author First Name
                        </label>
                        <input
                            type="text"
                            name="authorFirstName"
                            id="authorFirstName"
                            value={book.authorFirstName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="authorLastName" className="block text-sm font-medium text-gray-700">
                            <RequiredFieldLabel>Author Last Name</RequiredFieldLabel>
                        </label>
                        <input
                            type="text"
                            name="authorLastName"
                            id="authorLastName"
                            required
                            value={book.authorLastName}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 ${fieldErrors.authorLastName ? 'border-red-500' : ''}`}
                        />
                        {fieldErrors.authorLastName && <p className="mt-1 text-sm text-red-500">{fieldErrors.authorLastName}</p>}
                    </div>
                </div>
                <div>
                    <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN</label>
                    <input
                        type="text"
                        name="isbn"
                        id="isbn"
                        value={book.isbn}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
                <div>
                    <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700">Published Date</label>
                    <input
                        type="date"
                        name="publishedDate"
                        id="publishedDate"
                        value={book.publishedDate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
                <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre</label>
                    <input
                        type="text"
                        name="genre"
                        id="genre"
                        value={book.genre}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
                <div>
                    <label htmlFor="pages" className="block text-sm font-medium text-gray-700">Number of Pages</label>
                    <input
                        type="number"
                        name="pages"
                        id="pages"
                        value={book.pages}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
                <div>
                    <label htmlFor="copies" className="block text-sm font-medium text-gray-700">Number of Copies</label>
                    <input
                        type="number"
                        name="copies"
                        id="copies"
                        min="1"
                        required
                        value={book.copies}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Add Book
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddBookManual;