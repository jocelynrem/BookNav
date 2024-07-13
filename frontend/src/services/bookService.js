// frontend/src/services/bookService.js
import apiClient from './apiClient';

const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_API_URL
    : process.env.NODE_ENV === 'test'
        ? process.env.REACT_APP_TEST_API_URL
        : process.env.REACT_APP_API_URL;

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Navigation Functions
export const getToken = () => localStorage.getItem('token');

const headersWithAuth = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Authentication functions
export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post(`${apiUrl}/auth/register`, userData);
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await apiClient.post(`${apiUrl}/auth/login`, credentials);
        const data = response.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userRole', data.role);
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    localStorage.removeItem('currentRoute'); // Clear the saved route
    localStorage.removeItem('userBooks'); // Clear user-specific books data
};

// API related functions
export const getBooks = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/books/user-books`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user books:', error);
        throw error;
    }
};

export const createBook = async (book) => {
    try {
        const response = await apiClient.post(`${apiUrl}/books`, book);
        return response.data;
    } catch (error) {
        console.error('Error creating book:', error);
        throw error;
    }
};

export const updateBook = async (id, book) => {
    try {
        if (book.copies) {
            book.copies = parseInt(book.copies, 10);
        }
        const response = await apiClient.patch(`${apiUrl}/books/${id}`, book);
        return response.data;
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
};

export const updateBookCopies = async (id, numberOfCopies) => {
    try {
        const response = await apiClient.patch(`${apiUrl}/books/${id}/updateCopies`, { copies: parseInt(numberOfCopies, 10) });
        return response.data;
    } catch (error) {
        console.error('Error updating book copies:', error);
        throw error;
    }
};

export const deleteBook = async (id) => {
    try {
        const response = await apiClient.delete(`${apiUrl}/books/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error;
    }
};

export const fetchBookByISBN = async (isbn) => {
    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        const data = await response.json();
        const bookData = data[`ISBN:${isbn}`];

        if (!bookData) {
            throw new Error('No book data found');
        }

        return {
            id: isbn,
            title: bookData.title || 'Unknown Title',
            author: bookData.authors ? bookData.authors.map(author => author.name).join(', ') : 'Unknown Author',
            publishedDate: bookData.publish_date ? formatDate(bookData.publish_date) : 'Unknown',
            pages: bookData.number_of_pages || 0,
            genre: bookData.subjects ? bookData.subjects.map(subject => subject.name).join(', ') : 'Unknown Genre',
            subject: bookData.subjects ? bookData.subjects[0].name : 'Unknown Subject',
            coverImage: bookData.cover ? bookData.cover.large : '',
            isbn: isbn,
            copies: 1,
            readingLevel: 'Unknown',
            lexileScore: null,
            arPoints: null,
            availableCopies: 1
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchBooksByTitle = async (title) => {
    const response = await fetch(`https://openlibrary.org/search.json?title=${title}`);
    if (!response.ok) {
        throw new Error('Failed to fetch books');
    }
    const data = await response.json();

    return data.docs.map(book => {
        const authors = book.author_name && book.author_name.length > 0 ? book.author_name.join(', ') : 'Unknown';
        return {
            id: book.key,
            title: book.title,
            author: authors,
            publishedDate: book.first_publish_year ? formatDate(new Date(book.first_publish_year, 0, 1)) : null,
            pages: book.number_of_pages_median || 0,
            genre: book.subject_facet ? book.subject_facet[0] : 'Unknown',
            subject: book.subject ? book.subject[0] : 'Unknown',
            coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : '',
            isbn: book.isbn ? book.isbn[0] : 'N/A',
            copies: 1,
            readingLevel: 'Unknown',
            lexileScore: null,
            arPoints: null,
            availableCopies: 1
        };
    });
};

export const fetchBooksByAuthor = async (author) => {
    const response = await fetch(`https://openlibrary.org/search.json?author=${author}`);
    if (!response.ok) {
        throw new Error('Failed to fetch books');
    }
    const data = await response.json();

    return data.docs.map(book => {
        const authors = book.author_name && book.author_name.length > 0 ? book.author_name.join(', ') : 'Unknown';
        return {
            id: book.key,
            title: book.title,
            author: authors,
            publishedDate: book.first_publish_year ? formatDate(new Date(book.first_publish_year, 0, 1)) : null,
            pages: book.number_of_pages_median || 0,
            genre: book.subject_facet ? book.subject_facet[0] : 'Unknown',
            subject: book.subject ? book.subject[0] : 'Unknown',
            coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : '',
            isbn: book.isbn ? book.isbn[0] : 'N/A',
            copies: 1,
            readingLevel: 'Unknown',
            lexileScore: null,
            arPoints: null,
            availableCopies: 1
        };
    });
};

// Functions for managing user's books
export const addUserBook = async (book, copies, setNotification, setDialog, setUndoBook, setUserBooks) => {
    try {
        const existingBooks = await getUserBooks();
        const existingBook = existingBooks.find(b =>
            b.title && book.title && b.title.toLowerCase() === book.title.toLowerCase() &&
            b.author && book.author && b.author.toLowerCase() === book.author.toLowerCase()
        );

        if (existingBook) {
            setDialog({
                open: true,
                title: `The book "${book.title}" by ${book.author} already exists in your library.`,
                content: "How many additional copies would you like to add?",
                onConfirm: async (numberOfCopies) => {
                    if (numberOfCopies && numberOfCopies > 0) {
                        const updatedBook = await updateBookCopies(existingBook._id, parseInt(existingBook.copies, 10) + parseInt(numberOfCopies, 10));
                        setNotification({ show: true, message: `${numberOfCopies} copies of ${book.title} added to your library!` });
                        setUserBooks(prevBooks => prevBooks.map(b => b._id === existingBook._id ? updatedBook : b));
                    }
                }
            });
            return existingBook;
        } else {
            const response = await apiClient.post(`${apiUrl}/books/add`, book);
            const newBook = response.data;
            setUndoBook(newBook);
            setNotification({ show: true, message: `Book "${book.title}" added to your library!`, undo: true });
            return newBook;
        }
    } catch (err) {
        console.error('Failed to add book:', err);
        setNotification({ show: true, message: 'Failed to add book.', error: true });
        throw err;
    }
};

export const getUserBooks = async () => {
    try {
        const response = await apiClient.get(`${apiUrl}/books/user-books`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user books:', error);
        throw error;
    }
};
