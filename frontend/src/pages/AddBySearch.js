// frontend/src/pages/AddBySearch.js
import React, { useState, useEffect } from 'react';
import { fetchBooksByTitle, fetchBooksByAuthor, fetchBookByISBN, addUserBook, deleteBook, getUserBooks } from '../services/bookService';
import { ClipLoader } from 'react-spinners';
import Quagga from 'quagga';
import SearchBookTable from '../components/search/SearchBookTable';
import SlideoutParent from '../components/slideout/SlideoutParent';
import BookSearch from '../components/search/BookSearch';
import Notification from '../components/addBookFunction/Notification';
import ConfirmationDialog from '../components/addBookFunction/ConfirmationDialog';

const AddBySearch = () => {
    const [searchType, setSearchType] = useState('isbn');
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [userBooks, setUserBooks] = useState([]);
    const [error, setError] = useState('');
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', error: false, undo: false });
    const [dialog, setDialog] = useState({ open: false, title: '', content: '', onConfirm: () => { } });
    const [undoBook, setUndoBook] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

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
            console.log('No code detected:', result);
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

    const loadMore = () => {
        setLimit((prevLimit) => prevLimit + 10);
    };

    const handleTitleClick = (book) => {
        setSelectedBook(book);
        setIsSlideoutOpen(true);
    };

    const handleSlideoutClose = () => {
        setIsSlideoutOpen(false);
        setSelectedBook(null);
    };

    const handleAddBook = async (book, copies) => {
        const addedBook = await addUserBook(book, copies, setNotification, setDialog, setUndoBook);
        if (addedBook) {
            const { title, author } = book;
            const [authorFirstName, authorLastName] = author ? author.split(' ') : ['', ''];

            setUserBooks(prevBooks => [
                ...prevBooks,
                {
                    title,
                    authorFirstName,
                    authorLastName,
                    copies,
                    _id: addedBook._id // Ensure the ID returned from the backend is used
                }
            ]);
            setUndoBook(addedBook); // Set the undoBook state
        }
    };

    const handleUndo = async () => {
        if (undoBook) {
            await deleteBook(undoBook._id); // Use the book ID for deletion
            setUserBooks(prevBooks => prevBooks.filter(book => book._id !== undoBook._id)); // Remove the book from state
            setNotification({ show: false, message: '' });
            setUndoBook(null);
        }
    };

    return (
        <div className="relative">
            <div className="px-4 sm:px-6 lg:px-8">
                <h2 className="text-lg font-medium text-gray-900">Search for a Book</h2>
                <BookSearch
                    query={query}
                    handleChange={(e) => setQuery(e.target.value)}
                    handleSearchTypeChange={(e) => setSearchType(e.target.value)}
                    handleSearch={handleSearch}
                    searchType={searchType}
                    handleScanToggle={() => setScanning(!scanning)}
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
                            books={books.slice(0, limit)}
                            userBooks={userBooks}
                            onAddBook={handleAddBook}
                            onTitleClick={handleTitleClick}
                            setDialog={setDialog}
                            setUserBooks={setUserBooks}
                        />
                        {books.length > limit && (
                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={loadMore}
                                    className="text-teal-700 hover:text-teal-900"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {selectedBook && (
                    <SlideoutParent
                        isOpen={isSlideoutOpen}
                        onClose={handleSlideoutClose}
                        book={selectedBook}
                        setUserBooks={setUserBooks}
                    />
                )}
                <Notification notification={notification} setNotification={setNotification} onUndo={handleUndo} />
                <ConfirmationDialog dialog={dialog} setDialog={setDialog} />
            </div>
        </div>
    );
};

export default AddBySearch;
