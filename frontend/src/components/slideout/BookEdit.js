//frontend/src/components/slideout/BookEdit.js
import React, { useState, useEffect } from 'react';
import { updateBook, deleteBook } from '../../services/bookService';
import Swal from 'sweetalert2';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const BookEdit = ({ book, onSave, onClose, fetchBooks, onView }) => {
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

    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: `${editingBook.title}`,
                text: `Delete this book?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
            });

            if (result.isConfirmed) {
                await deleteBook(editingBook._id);
                Swal.fire({
                    title: `${editingBook.title} deleted`,
                    position: 'bottom-end',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
                fetchBooks();
                onClose();
            }
        } catch (error) {
            console.error('Failed to delete book:', error);
            Swal.fire('Error!', 'Failed to delete the book.', 'error');
        }
    };

    const renderField = (label, name, type = "text") => (
        <label className="block mb-2">
            {label}
            <input
                type={type}
                name={name}
                value={editingBook[name] || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
            />
        </label>
    );

    if (!editingBook) return null;

    return (
        <div className="space-y-4 pb-8">
            <div className="flex justify-between items-center pb-2">
                <button
                    type="button"
                    className="flex items-center text-teal-700 hover:text-teal-900"
                    onClick={onView}
                >
                    View book details
                    <ArrowRightIcon className="ml-1 h-5 w-5" />
                </button>
            </div>
            {renderField("Title", "title")}
            {renderField("Author", "author")}
            {renderField("Genre", "genre")}
            {renderField("Subject", "subject")}
            {renderField("Published Date", "publishedDate", "date")}
            {renderField("Pages", "pages", "number")}
            {renderField("Copies", "copies", "number")}
            {renderField("ISBN", "isbn")}
            {renderField("Reading Level", "readingLevel")}
            {renderField("Lexile Score", "lexileScore")}
            {renderField("AR Points", "arPoints")}
            <div className="flex justify-end px-4 py-4 sm:px-6">
                <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
                    onClick={handleSave}
                >
                    Save
                </button>
                <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ml-2"
                    onClick={handleDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default BookEdit;