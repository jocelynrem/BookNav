import React, { useState, useEffect } from 'react';
import { getOverdueBooks } from '../../services/dashboardService';
import { returnBook } from '../../services/checkoutService';
import Swal from 'sweetalert2';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import Breadcrumbs from './Breadcrumbs';

const OverdueBooks = () => {
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchOverdueBooks();
    }, []);

    const fetchOverdueBooks = async () => {
        setIsLoading(true);
        try {
            const books = await getOverdueBooks();
            setOverdueBooks(books);
        } catch (error) {
            console.error('Error fetching overdue books:', error);
            Swal.fire('Error', 'Failed to fetch overdue books', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturnBook = async (checkoutId) => {
        try {
            await returnBook(checkoutId);
            Swal.fire('Success', 'Book returned successfully', 'success');
            fetchOverdueBooks(); // Refresh the list
        } catch (error) {
            console.error('Error returning book:', error);
            Swal.fire('Error', 'Failed to return book', 'error');
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = overdueBooks.slice(indexOfFirstItem, indexOfLastItem);


    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs
                items={[
                    { name: 'Overdue Books', href: '/overdue-books' }
                ]}
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Overdue Books</h1>
            {overdueBooks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No overdue books at the moment.</p>
            ) : (
                <>
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Title</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Student</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Days Overdue</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentItems.map((book) => (
                                            <tr key={book._id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{book.bookCopy.book.title}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{`${book.student.firstName} ${book.student.lastName}`}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.daysOverdue}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                    <button
                                                        onClick={() => handleReturnBook(book._id)}
                                                        className="text-pink-600 hover:text-pink-900"
                                                    >
                                                        Return<span className="sr-only">, {book.bookCopy.book.title}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {Math.ceil(overdueBooks.length / itemsPerPage) > 1 && (
                        <Pagination
                            itemsPerPage={itemsPerPage}
                            totalItems={overdueBooks.length}
                            paginate={paginate}
                            currentPage={currentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === pageNumbers.length}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                        <span className="font-medium">{totalItems}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {pageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${number === currentPage
                                    ? 'z-10 bg-pink-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === pageNumbers.length}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default OverdueBooks;
