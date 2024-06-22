import React, { useState, useEffect } from 'react';
import { fetchBooksByTitle, fetchBooksByAuthor, fetchBookByISBN, addBookToLibrary } from '../services/bookService';
import { ClipLoader } from 'react-spinners';
import { Html5QrcodeScanner } from 'html5-qrcode';
import SearchBookTable from './SearchBookTable';
import SlideoutParent from './SlideoutParent';
import BookSearch from './BookSearch';

const AddBySearch = () => {
    const [searchType, setSearchType] = useState('isbn');
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        let scanner;
        if (scanning) {
            scanner = new Html5QrcodeScanner(
                "scanner",
                { fps: 10, qrbox: 250 },
                false
            );
            scanner.render(handleScan, handleError);

            return () => {
                scanner.clear().catch(error => {
                    console.error('Failed to clear scanner.', error);
                });
            };
        }
    }, [scanning]);

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
        setQuery(''); // Clear the search input when the search type is changed
    };

    const handleSearch = async () => {
        setLoading(true);
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

    const handleScan = (decodedText, decodedResult) => {
        if (decodedText) {
            setQuery(decodedText);
            setScanning(false);
            handleSearchByISBN(decodedText);
        }
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

    const handleError = (err) => {
        console.error('QR code parse error', err);
        setError('Failed to scan ISBN. Ensure the barcode is properly visible and try again.');
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

    return (
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
                <div id="scanner" className="mt-4"></div>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {loading && (
                <div className="mt-4 text-center">
                    <ClipLoader size={35} color={"#4A90E2"} loading={loading} />
                </div>
            )}
            {books.length > 0 && !loading && (
                <div className="mt-8 flow-root">
                    <SearchBookTable
                        books={books.slice(0, limit)}
                        onAddBook={addBookToLibrary}
                        onTitleClick={handleTitleClick}
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
                />
            )}
        </div>
    );
};

export default AddBySearch;
