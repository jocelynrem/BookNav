import React, { useEffect, useState } from 'react';
import { getBooks, updateBook, deleteBook } from '../services/bookService';
import Swal from 'sweetalert2';
import { TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

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
            const initializedBooks = data.map(book => ({
                ...book,
                copies: book.copies || [{ status: 'in library' }],
            }));
            setBooks(initializedBooks);
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
                Swal.fire('Deleted!', `"${title}" has been deleted.`, 'success');
                fetchBooks();
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

    const getCopyStatus = (copies) => {
        const inLibrary = (copies || []).filter(copy => copy.status === 'in library').length;
        const checkedOut = (copies || []).filter(copy => copy.status === 'checked out').length;
        return { inLibrary, checkedOut };
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

    const hasCheckedOutBooks = books.some(book => getCopyStatus(book.copies).checkedOut > 0);

    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? <ChevronUpIcon className="h-5 w-5 inline" /> : <ChevronDownIcon className="h-5 w-5 inline" />;
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Book List</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage your book collection.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="border p-2"
                    />
                </div>
            </div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th
                                        scope="col"
                                        className="cursor-pointer py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                        onClick={() => handleSortChange('title')}
                                    >
                                        <a href="#" className="group inline-flex">
                                            Title
                                            <span className={`ml-2 flex-none rounded ${sortField === 'title' ? 'bg-gray-100 text-gray-900' : 'invisible text-gray-400 group-hover:visible group-focus:visible'}`}>
                                                {sortField === 'title' ? (sortOrder === 'asc' ? <ChevronUpIcon className="h-5 w-5" aria-hidden="true" /> : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />) : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
                                            </span>
                                        </a>
                                    </th>
                                    <th
                                        scope="col"
                                        className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        onClick={() => handleSortChange('author')}
                                    >
                                        <a href="#" className="group inline-flex">
                                            Author
                                            <span className={`ml-2 flex-none rounded ${sortField === 'author' ? 'bg-gray-100 text-gray-900' : 'invisible text-gray-400 group-hover:visible group-focus:visible'}`}>
                                                {sortField === 'author' ? (sortOrder === 'asc' ? <ChevronUpIcon className="h-5 w-5" aria-hidden="true" /> : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />) : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
                                            </span>
                                        </a>
                                    </th>
                                    <th
                                        scope="col"
                                        className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        onClick={() => handleSortChange('inLibrary')}
                                    >
                                        <a href="#" className="group inline-flex">
                                            Copies
                                            <span className={`ml-2 flex-none rounded ${sortField === 'inLibrary' ? 'bg-gray-100 text-gray-900' : 'invisible text-gray-400 group-hover:visible group-focus:visible'}`}>
                                                {sortField === 'inLibrary' ? (sortOrder === 'asc' ? <ChevronUpIcon className="h-5 w-5" aria-hidden="true" /> : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />) : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
                                            </span>
                                        </a>
                                    </th>
                                    {hasCheckedOutBooks && (
                                        <th
                                            scope="col"
                                            className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                            onClick={() => handleSortChange('checkedOut')}
                                        >
                                            <a href="#" className="group inline-flex">
                                                Checked Out
                                                <span className={`ml-2 flex-none rounded ${sortField === 'checkedOut' ? 'bg-gray-100 text-gray-900' : 'invisible text-gray-400 group-hover:visible group-focus:visible'}`}>
                                                    {sortField === 'checkedOut' ? (sortOrder === 'asc' ? <ChevronUpIcon className="h-5 w-5" aria-hidden="true" /> : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />) : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
                                                </span>
                                            </a>
                                        </th>
                                    )}
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Delete</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {sortedBooks.map((book) => {
                                    const { inLibrary, checkedOut } = getCopyStatus(book.copies);
                                    const authorName = `${book.authorLastName}, ${book.authorFirstName}`;
                                    return (
                                        <tr key={book._id}>
                                            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                <div className="flex items-center">
                                                    {book.coverImage && (
                                                        <div className="h-11 w-11 flex-shrink-0">
                                                            <img className="h-11 w-11 rounded-full" src={book.coverImage} alt="" />
                                                        </div>
                                                    )}
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{book.title}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{authorName}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{inLibrary}</td>
                                            {checkedOut > 0 && (
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{checkedOut}</td>
                                            )}
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <a
                                                    href="#"
                                                    onClick={() => handleEditClick(book)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit<span className="sr-only">, {book.title}</span>
                                                </a>
                                            </td>
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <button
                                                    onClick={() => handleDeleteBook(book._id, book.title)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                    <span className="sr-only">, {book.title}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {editingBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Book</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={editingBook.title}
                            onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="text"
                            placeholder="Author First Name"
                            value={editingBook.authorFirstName}
                            onChange={(e) => setEditingBook({ ...editingBook, authorFirstName: e.target.value })}
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="text"
                            placeholder="Author Last Name"
                            value={editingBook.authorLastName}
                            onChange={(e) => setEditingBook({ ...editingBook, authorLastName: e.target.value })}
                            className="border p-2 mb-2 w-full"
                        />
                        <button
                            onClick={() => handleUpdateBook(editingBook._id)}
                            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-2"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setEditingBook(null)}
                            className="block rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookList;
