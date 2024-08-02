import React, { useState, useEffect } from 'react';
import { fetchBooksByTitle, fetchBooksByAuthor, fetchBookByISBN, addUserBook, deleteBook, getUserBooks } from '../../services/bookService';
import { ClipLoader } from 'react-spinners';
import Quagga from 'quagga';
import SearchBookTable from '../search/SearchBookTable';
import SlideoutParent from '../slideout/SlideoutParent';
import SearchDetails from '../slideout/SearchDetails';
import BookEdit from '../slideout/BookEdit';
import BookSearch from '../search/BookSearch';
import Notification from './Notification';
import ConfirmationDialog from './ConfirmationDialog';
import Pagination from './Pagination'


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
        // Fetch user books on component mount
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
        // Clear any lingering state when component mounts
        return () => {
            setScanning(false);
            setSelectedBook(null);
            setIsSlideoutOpen(false);
        };
    }, []);

    useEffect(() => {
        if (scanning) {
            initializeScanner();
        }
        return () => {
            if (scanning) {
                Quagga.offDetected(handleSearchScan);
                Quagga.stop();
            }
        };
    }, [scanning]);

    const initializeScanner = () => {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#scanner'),
                constraints: {
                    width: 320,
                    height: 240,
                    facingMode: "environment"
                },
            },
            decoder: {
                readers: ["ean_reader"]
            },
        }, function (err) {
            if (err) {
                console.error(err);
                setError('Failed to initialize barcode scanner');
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected(handleSearchScan);
    };


    const handleSearchScan = (result) => {
        if (result && result.codeResult && result.codeResult.code) {
            const scannedCode = result.codeResult.code;
            const isbn = scannedCode.startsWith('978') ? scannedCode : `978${scannedCode}`;

            setQuery(isbn);
            setBooks([]); // Clear previous results
            setHasSearched(false); // Reset search status
            setScanning(false);
            handleSearchByISBN(isbn);
        } else {
            setBooks([]); // Clear previous results even if scan fails
            setHasSearched(false); // Reset search status
            console.error('Failed to scan ISBN.');
        }
    };

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
        setQuery(''); // Clear the search input
        setBooks([]); // Clear previous results
        setHasSearched(false); // Reset search status
    };

    const handleSearch = async () => {
        setBooks([]); // Clear previous results
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
        setBooks([]); // Clear previous results
        setHasSearched(false); // Reset search status
        setScanning(!scanning);
    };


    const handleSearchByISBN = async (isbn) => {
        setBooks([]); // Clear previous results
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

    const handleSaveBook = async (book, copies, isExisting) => {
        try {
            let addedOrUpdatedBook;
            if (isExisting) {
                // Adding copies to an existing book
                addedOrUpdatedBook = await addBookCopies(book._id, copies);
                setNotification({ show: true, message: `Added ${copies} copies to "${book.title}".`, error: false });
            } else {
                // Adding a new book
                addedOrUpdatedBook = await addUserBook(book, copies, setNotification, setDialog, setUndoBook);
                setNotification({ show: true, message: `Added "${book.title}" to your library.`, error: false });
            }

            if (addedOrUpdatedBook) {
                setUserBooks(prevBooks => {
                    const existingBookIndex = prevBooks.findIndex(b => b._id === addedOrUpdatedBook._id);
                    if (existingBookIndex !== -1) {
                        // Update existing book
                        return prevBooks.map((b, index) =>
                            index === existingBookIndex ? addedOrUpdatedBook : b
                        );
                    } else {
                        // Add new book
                        return [...prevBooks, addedOrUpdatedBook];
                    }
                });
            }
            setIsSlideoutOpen(false);
        } catch (error) {
            console.error('Failed to add book or copies:', error);
            setNotification({ show: true, message: 'Failed to update library.', error: true });
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
                {/* <h2 className="text-lg font-medium text-gray-900">Search for a Book</h2> */}
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
                {/* {!loading && !hasSearched && (
                    <p className="mt-4 text-center text-gray-500">Enter a search query to find books.</p>
                )} */}
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
                                userBooks={userBooks}
                                onEdit={() => setIsEditing(true)}
                                onClose={handleSlideoutClose}
                                setNotification={setNotification}
                                setDialog={setDialog}
                                setUserBooks={setUserBooks}
                                onAddBook={handleSaveBook}
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

export default AddBySearch;
