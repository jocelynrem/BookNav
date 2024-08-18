import React, { useState, useEffect } from 'react';
import {
    fetchBooksByTitle,
    fetchBooksByAuthor,
    fetchBookByISBN,
    addUserBook,
    deleteBook,
    getUserBooks
} from '../../services/bookService';
import { ClipLoader } from 'react-spinners';
import SearchBookTable from '../search/SearchBookTable';
import SlideoutParent from '../slideout/SlideoutParent';
import SearchDetails from '../slideout/SearchDetails';
import BookEdit from '../slideout/BookEdit';
import BookSearch from '../search/BookSearch';
import Notification from './Notification';
import ConfirmationDialog from './ConfirmationDialog';
import Pagination from '../Pagination';
import ISBNScannerModal from './ISBNScannerModal';

const AddBySearch = () => {
    const [searchType, setSearchType] = useState('ISBN');
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [userBooks, setUserBooks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', error: false });
    const [dialog, setDialog] = useState({ open: false, title: '', content: '', onConfirm: () => { } });
    const [undoBook, setUndoBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
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
        if (query) {
            handleSearch(); // Automatically trigger search when query changes
        }
    }, [query]);

    const handleSearchScan = (result) => {
        setQuery(result);
        setIsModalOpen(false);
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
        setQuery('');
        setBooks([]);
        setHasSearched(false);
        setError(''); // Clear any previous errors when changing search type
    };

    const handleSearch = async () => {
        setBooks([]);
        setLoading(true);
        setHasSearched(true); // Mark that a search has been initiated

        if (!query) {
            setError(`Please enter a ${searchType} to search.`);
            setLoading(false);
            return;
        }

        try {
            let data;
            if (searchType === 'title') {
                data = await fetchBooksByTitle(query);
                if (data.length === 0) throw new Error('No books found with that title.');
            } else if (searchType === 'author') {
                data = await fetchBooksByAuthor(query);
                if (data.length === 0) throw new Error('No books found by that author.');
            } else {
                data = await fetchBookByISBN(query);
                if (!data) throw new Error('No book found with that ISBN.');
            }
            setBooks(searchType === 'ISBN' ? [data] : data);
            setError('');
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleScanToggle = () => {
        setQuery('');  // Clear the search input
        setIsModalOpen(!isModalOpen);  // Toggle the modal
        setBooks([]);  // Clear any previous search results
        setHasSearched(false);  // Reset the search status
        setError('');  // Clear any previous errors
    };

    const handleTitleClick = (book) => {
        setSelectedBook(book);
        setIsSlideoutOpen(true);
        setIsEditing(false);
    };

    const handleSlideoutClose = () => {
        setIsSlideoutOpen(false);
        setSelectedBook(null);
    };

    const handleSaveBook = async (book, copies, isExisting) => {
        try {
            let addedOrUpdatedBook;
            if (isExisting) {
                addedOrUpdatedBook = await addBookCopies(book._id, copies);
                setNotification({ show: true, message: `Added ${copies} copies to "${book.title}".`, error: false });
            } else {
                addedOrUpdatedBook = await addUserBook(book, copies, setNotification, setDialog, setUndoBook);
                setNotification({ show: true, message: `Added "${book.title}" to your library.`, error: false });
            }

            if (addedOrUpdatedBook) {
                setUserBooks(prevBooks => {
                    const existingBookIndex = prevBooks.findIndex(b => b._id === addedOrUpdatedBook._id);
                    if (existingBookIndex !== -1) {
                        return prevBooks.map((b, index) =>
                            index === existingBookIndex ? addedOrUpdatedBook : b
                        );
                    } else {
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
                <BookSearch
                    query={query}
                    handleChange={e => setQuery(e.target.value)}
                    handleSearchTypeChange={handleSearchTypeChange}
                    handleSearch={handleSearch}
                    searchType={searchType}
                    handleScanToggle={handleScanToggle}
                    scanning={isModalOpen}
                />
                <ISBNScannerModal
                    isOpen={isModalOpen}
                    onClose={handleScanToggle}
                    onDetected={handleSearchScan}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                {loading && (
                    <div className="mt-4 text-center">
                        <ClipLoader size={35} color={"#4A90E2"} loading={loading} />
                    </div>
                )}
                {!loading && hasSearched && books.length === 0 && (
                    <p className="mt-4 text-center text-gray-500">No books found. Try a different search.</p>
                )}
                {!hasSearched && !loading && (
                    <p className="mt-4 text-center text-gray-500">Please choose a search type and enter a query, or scan an ISBN to start searching.</p>
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
