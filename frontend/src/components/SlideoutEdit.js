import React, { useState, useEffect } from 'react';
import { updateBook } from '../services/bookService';

const SlideoutEdit = ({ book, onSave, onClose }) => {
    const [editingBook, setEditingBook] = useState(book);

    useEffect(() => {
        setEditingBook(book);
    }, [book]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingBook({ ...editingBook, [name]: value });
    };

    const handleSave = async () => {
        try {
            await updateBook(editingBook._id, editingBook);
            onSave(editingBook);
        } catch (error) {
            console.error('Failed to update book:', error);
        }
        onClose();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    if (!editingBook) return null;

    return (
        <div className="mt-2 space-y-6">
            <label>
                Title
                <input
                    type="text"
                    name="title"
                    value={editingBook.title}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            <label>
                Author First Name
                <input
                    type="text"
                    name="authorFirstName"
                    value={editingBook.authorFirstName}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            <label>
                Author Last Name
                <input
                    type="text"
                    name="authorLastName"
                    value={editingBook.authorLastName}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            <label>
                Genre
                <input
                    type="text"
                    name="genre"
                    value={editingBook.genre}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            <label>
                Subject
                <input
                    type="text"
                    name="subject"
                    value={editingBook.subject}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            <label>
                Published Date
                <input
                    type="date"
                    name="publishedDate"
                    value={formatDate(editingBook.publishedDate)}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            <label>
                Pages
                <input
                    type="number"
                    name="pages"
                    value={editingBook.pages}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            <label>
                Copies
                <input
                    type="number"
                    name="copies"
                    value={editingBook.copies}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            {/* <label>
                Cover Image
                <input
                    type="text"
                    name="coverImage"
                    value={editingBook.coverImage}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label> */}
            <label>
                ISBN
                <input
                    type="text"
                    name="isbn"
                    value={editingBook.isbn}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                />
            </label>
            <div className="flex justify-end px-4 py-4 sm:px-6">
                <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default SlideoutEdit;
