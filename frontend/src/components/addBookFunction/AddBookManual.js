import React, { useState } from 'react';
import { createBook, getBooks } from '../../services/bookService';
import { useNavigate } from 'react-router-dom';

const AddBookManual = () => {
    const [book, setBook] = useState({
        title: '',
        author: '',
        isbn: '',
        publishedDate: '',
        genre: '',
        coverImage: '',
        pages: '',
        copies: 1,
        readingLevel: '',
        lexileScore: '',
        arPoints: ''
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
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!book.title.trim()) errors.title = 'Title is required';
        if (!book.author.trim()) errors.author = 'Author name is required';
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
            setSuccess('Book added successfully!');
            setError('');

            try {
                await getBooks();
            } catch (fetchError) {
                console.error('Error fetching updated library:', fetchError);
            }

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
                <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                        <RequiredFieldLabel>Author Name</RequiredFieldLabel>
                    </label>
                    <input
                        type="text"
                        name="author"
                        id="author"
                        required
                        value={book.author}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 ${fieldErrors.author ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.author && <p className="mt-1 text-sm text-red-500">{fieldErrors.author}</p>}
                </div>
                <div className="sm:flex sm:space-x-4">
                    <div className="flex-1 mb-4 sm:mb-0">
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
                    <div className="flex-1">
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
                <div className="sm:flex sm:space-x-4">
                    <div className="flex-1 mb-4 sm:mb-0">
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
                    <div className="flex-1">
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
                </div>
                <div className="sm:flex sm:space-x-4">
                    <div className="flex-1 mb-4 sm:mb-0">
                        <label htmlFor="readingLevel" className="block text-sm font-medium text-gray-700">Reading Level</label>
                        <input
                            type="text"
                            name="readingLevel"
                            id="readingLevel"
                            value={book.readingLevel}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>
                    <div className="flex-1 mb-4 sm:mb-0">
                        <label htmlFor="lexileScore" className="block text-sm font-medium text-gray-700">Lexile Score</label>
                        <input
                            type="text"
                            name="lexileScore"
                            id="lexileScore"
                            value={book.lexileScore}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="arPoints" className="block text-sm font-medium text-gray-700">AR Points</label>
                        <input
                            type="text"
                            name="arPoints"
                            id="arPoints"
                            value={book.arPoints}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>
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