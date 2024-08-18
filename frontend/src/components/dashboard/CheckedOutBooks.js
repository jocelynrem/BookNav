import React, { useState, useEffect } from 'react';
import { getCheckedOutBooks } from '../../services/dashboardService';
import { returnBook } from '../../services/checkoutService';
import Swal from 'sweetalert2';
import Breadcrumbs from './Breadcrumbs';
import Pagination from '../Pagination';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const CheckedOutBooks = () => {
    const [checkedOutBooks, setCheckedOutBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCheckedOutBooks();
    }, []);

    const fetchCheckedOutBooks = async () => {
        setIsLoading(true);
        try {
            const books = await getCheckedOutBooks();
            setCheckedOutBooks(books);
        } catch (error) {
            console.error('Error fetching checked out books:', error);
            setError('Failed to fetch checked out books');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturnBook = async (checkoutId) => {
        try {
            await returnBook(checkoutId);
            Swal.fire('Success', 'Book returned successfully', 'success');
            fetchCheckedOutBooks(); // Refresh the list
        } catch (error) {
            console.error('Error returning book:', error);
            Swal.fire('Error', 'Failed to return book', 'error');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedBooks = [...checkedOutBooks].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredBooks = sortedBooks.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.student && book.student.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs
                items={[
                    { name: 'Checked Out Books', href: '/checked-out-books' }
                ]}
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Checked Out Books</h1>

            <div className="mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or student"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                />
            </div>

            {filteredBooks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No books are currently checked out.</p>
            ) : (
                <>
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer sm:pl-0"
                                                onClick={() => handleSort('title')}
                                            >
                                                Title
                                                {sortConfig.key === 'title' && (
                                                    sortConfig.direction === 'asc' ? <ChevronUpIcon className="inline h-4 w-4 ml-1" /> : <ChevronDownIcon className="inline h-4 w-4 ml-1" />
                                                )}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                                onClick={() => handleSort('student')}
                                            >
                                                Student
                                                {sortConfig.key === 'student' && (
                                                    sortConfig.direction === 'asc' ? <ChevronUpIcon className="inline h-4 w-4 ml-1" /> : <ChevronDownIcon className="inline h-4 w-4 ml-1" />
                                                )}
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentItems.map((book) => (
                                            <tr key={book._id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{book.title}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {book.student || 'Unknown Student'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {book.dueDate ? new Date(book.dueDate).toLocaleDateString() : 'Unknown'}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                    <button
                                                        onClick={() => handleReturnBook(book._id)}
                                                        className="text-pink-600 hover:text-pink-900"
                                                    >
                                                        Return<span className="sr-only">, {book.title}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {Math.ceil(filteredBooks.length / itemsPerPage) > 1 && (
                        <Pagination
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredBooks.length}
                            paginate={paginate}
                            currentPage={currentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default CheckedOutBooks;
