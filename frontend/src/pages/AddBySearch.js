import React, { useState, useEffect } from 'react';
import { fetchBooksByTitle, fetchBooksByAuthor, fetchBookByISBN, addUserBook, deleteBook, getUserBooks } from '../services/bookService';
import { ClipLoader } from 'react-spinners';
import Quagga from 'quagga';
import SearchBookTable from '../components/search/SearchBookTable';
import SlideoutParent from '../components/slideout/SlideoutParent';
import SearchDetails from '../components/slideout/SearchDetails';
import BookEdit from '../components/slideout/BookEdit';
import BookSearch from '../components/search/BookSearch';
import Notification from '../components/addBookFunction/Notification';
import ConfirmationDialog from '../components/addBookFunction/ConfirmationDialog';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const AddBySearch = () => {
    const [searchType, setSearchType] = useState('isbn');
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [userBooks, setUserBooks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', error: false, undo: false });
    const [dialog, setDialog] = useState({ open: false, title: '', content: '', onConfirm: () => { } });
    const [undoBook, setUndoBook] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const fetchUserBooks = async () => {
            try {
                const data = await getUserBooks();
                setUserBooks(data);
            } catch (err) {
                setError('Failed to fetch user books');
                console.error(err);
            }
        };

        fetchUserBooks();
    }, []);

    useEffect(() => {
        if (scanning) {
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector('#scanner'),
                    area: {
                        top: "0%",
                        right: "0%",
                        left: "0%",
                        bottom: "0%"
                    },
                    singleChannel: false
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                },
                decoder: {
                    readers: ["ean_reader"]
                },
                locate: true
            }, function (err) {
                if (err) {
                    console.error(err);
                    setError('Failed to initialize barcode scanner');
                    return;
                }
                Quagga.start();

                // Ensure the canvas is initialized with willReadFrequently attribute
                const canvas = document.querySelector('canvas');
                if (canvas) {
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                }
            });

            Quagga.onDetected(handleScan);

            return () => {
                Quagga.offDetected(handleScan);
                Quagga.stop();
            };
        }
    }, [scanning]);

    const handleScan = (result) => {
        if (result && result.codeResult && result.codeResult.code) {
            const scannedCode = result.codeResult.code;

            // Validate the scanned code
            const isbn = scannedCode.startsWith('978') ? scannedCode : `978${scannedCode}`;

            setQuery(isbn);
            setScanning(false);
            handleSearchByISBN(isbn);
        } else {
        }
    };

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
        setQuery(''); // Clear the search input when the search type is changed
    };

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
            let data;
            if (searchType === 'title') {
                data = await fetchBooksByTitle(query);
            } else if (searchType === 'author') {
                data = await fetchBooksByAuthor(query);
            } else {
                data = await fetchBookByISBN(query);
            }
            setBooks(searchType === 'isbn' ? [data] : data);
            setError('');
        } catch (err) {
            setError('Failed to fetch books');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleScanToggle = () => {
        setScanning(!scanning);
    };

    const handleSearchByISBN = async (isbn) => {
        setLoading(true);
        try {
            const data = await fetchBookByISBN(isbn);
            setBooks([data]);
            setError('');
        } catch (err) {
            setError('Failed to fetch book details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTitleClick = (book) => {
        setSelectedBook(book);
        setIsSlideoutOpen(true);
        setIsEditing(false);
    };

    const handleEditClick = (book) => {
        setSelectedBook(book);
        setIsSlideoutOpen(true);
        setIsEditing(true);
    };

    const handleSlideoutClose = () => {
        setIsSlideoutOpen(false);
        setSelectedBook(null);
    };

    const handleSaveBook = async (updatedBook) => {
        try {
            const addedBook = await addUserBook(updatedBook, updatedBook.copies, setNotification, setDialog, setUndoBook);
            if (addedBook) {
                setUserBooks(prevBooks => [...prevBooks, addedBook]);
                setNotification({ show: true, message: `Book "${updatedBook.title}" added to your library!`, undo: true });
                setUndoBook(addedBook);
            }
            setIsSlideoutOpen(false);
        } catch (error) {
            console.error('Failed to add book:', error);
            setNotification({ show: true, message: 'Failed to add book.', error: true });
        }
    };

    const handleUndo = async () => {
        if (undoBook) {
            await deleteBook(undoBook._id);
            setUserBooks(prevBooks => prevBooks.filter(book => book._id !== undoBook._id));
            setNotification({ show: false, message: '' });
            setUndoBook(null);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(books.length / itemsPerPage);
    const currentBooks = books.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="relative">
            <div className="px-4 sm:px-6 lg:px-8">
                <h2 className="text-lg font-medium text-gray-900">Search for a Book</h2>
                <BookSearch
                    query={query}
                    handleChange={handleChange}
                    handleSearchTypeChange={handleSearchTypeChange}
                    handleSearch={handleSearch}
                    searchType={searchType}
                    handleScanToggle={handleScanToggle}
                    scanning={scanning}
                />
                {scanning && (
                    <div id="scanner" className="mt-4" style={{ width: '320px', height: '240px', margin: '0 auto' }}></div>
                )}
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                {loading && (
                    <div className="mt-4 text-center">
                        <ClipLoader size={35} color={"#4A90E2"} loading={loading} />
                    </div>
                )}
                {!loading && !hasSearched && (
                    <p className="mt-4 text-center text-gray-500">Enter a search query to find books.</p>
                )}
                {!loading && hasSearched && books.length === 0 && (
                    <p className="mt-4 text-center text-gray-500">No books found. Try a different search.</p>
                )}
                {!loading && books.length > 0 && (
                    <div className="mt-8 flow-root">
                        <SearchBookTable
                            books={currentBooks}
                            userBooks={userBooks}
                            onAddBook={handleSaveBook}
                            onTitleClick={handleTitleClick}
                            onEditClick={handleEditClick}
                            setDialog={setDialog}
                            setUserBooks={setUserBooks}
                        />
                        {books.length > itemsPerPage && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={books.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                )}
                <SlideoutParent
                    isOpen={isSlideoutOpen}
                    onClose={handleSlideoutClose}
                    title={isEditing ? 'Edit Book' : 'Book Details'}
                    notification={notification}
                    setNotification={setNotification}
                    dialog={dialog}
                    setDialog={setDialog}
                >
                    {selectedBook && (
                        isEditing ? (
                            <BookEdit
                                book={selectedBook}
                                onSave={handleSaveBook}
                                onClose={handleSlideoutClose}
                                onView={() => setIsEditing(false)}
                            />
                        ) : (
                            <SearchDetails
                                book={selectedBook}
                                onEdit={() => setIsEditing(true)}
                                onClose={handleSlideoutClose}
                                setNotification={setNotification}
                                setDialog={setDialog}
                                setUserBooks={setUserBooks}
                            />
                        )
                    )}
                </SlideoutParent>
                <Notification notification={notification} setNotification={setNotification} onUndo={handleUndo} />
                <ConfirmationDialog dialog={dialog} setDialog={setDialog} />
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                        {[...Array(totalPages).keys()].map(page => (
                            <button
                                key={page + 1}
                                onClick={() => onPageChange(page + 1)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page + 1 ? 'bg-pink-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                            >
                                {page + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default AddBySearch;
