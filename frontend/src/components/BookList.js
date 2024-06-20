import React, { useEffect, useState } from 'react';
import { getBooks, updateBook, deleteBook } from '../services/bookService';
import Swal from 'sweetalert2';
import BookTable from './BookTable';
import BookSearch from './BookSearch';
import BookEditModal from './BookEditModal';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [editingBook, setEditingBook] = useState(null);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');

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

    const handleUpdateBook = async (id) => {
        try {
            const updatedBook = { ...editingBook };
            await updateBook(id, updatedBook);
            setEditingBook(null);
            fetchBooks();
        } catch (err) {
            setError('Failed to update book');
            console.error(err);
        }
    };

    const handleDeleteBook = async (id, title) => {
        try {
            const result = await Swal.fire({
                title: `${title}`,
                text: `Delete this book?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
            });

            if (result.isConfirmed) {
                await deleteBook(id);
                Swal.fire({
                    title: `${title} deleted`,
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
                }); fetchBooks();
            }
        } catch (err) {
            setError('Failed to delete book');
            console.error(err);
            Swal.fire('Error!', 'Failed to delete the book.', 'error');
        }
    };

    const handleEditClick = (book) => {
        setEditingBook(book);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const sortedBooks = books
        .filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (`${book.authorLastName}, ${book.authorFirstName}`).toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = sortField === 'author' ? a.authorLastName : a[sortField];
            const bValue = sortField === 'author' ? b.authorLastName : b[sortField];
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Book List</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage your book collection.</p>
                </div>
                <BookSearch searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
            </div>
            <BookTable
                books={books}
                sortedBooks={sortedBooks}
                handleEditClick={handleEditClick}
                handleDeleteBook={handleDeleteBook}
                sortField={sortField}
                sortOrder={sortOrder}
                handleSortChange={handleSortChange}
            />
            <BookEditModal
                editingBook={editingBook}
                setEditingBook={setEditingBook}
                handleUpdateBook={handleUpdateBook}
            />
        </div>
    );
};

export default BookList;
