import React, { useState, useEffect } from 'react';
import { updateBook, deleteBook } from '../services/bookService';
import Swal from 'sweetalert2';

const SlideoutEdit = ({ book, onSave, onClose, fetchBooks }) => {
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    if (!editingBook) return null;
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

export default SlideoutEdit;
