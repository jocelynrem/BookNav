const apiUrl = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_API_URL;

// Function to get the token from local storage
export const getToken = () => localStorage.getItem('token');

const headersWithAuth = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Authentication functions
export const registerUser = async (userData) => {
    const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    localStorage.setItem('token', data.token); // Save token to local storage
    return data;
};

export const logoutUser = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    localStorage.removeItem('userBooks'); // Clear user-specific books data
};

// API related functions
export const getBooks = async () => {
    const response = await fetch(`${apiUrl}/books/user-books`, {
        headers: headersWithAuth(),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const createBook = async (book) => {
    const bookData = {
        ...book,
        copies: parseInt(book.copies, 10)
    };

    const response = await fetch(`${apiUrl}/books`, {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify(bookData),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const updateBook = async (id, book) => {
    if (book.copies) {
        book.copies = parseInt(book.copies, 10);
    }

    const response = await fetch(`${apiUrl}/books/${id}`, {
        method: 'PATCH',
        headers: headersWithAuth(),
        body: JSON.stringify(book),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const updateBookCopies = async (id, numberOfCopies) => {
    const response = await fetch(`${apiUrl}/books/${id}/updateCopies`, {
        method: 'PATCH',
        headers: headersWithAuth(),
        body: JSON.stringify({ copies: parseInt(numberOfCopies, 10) }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const deleteBook = async (id) => {
    const response = await fetch(`${apiUrl}/books/${id}`, {
        method: 'DELETE',
        headers: headersWithAuth(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const fetchBookByISBN = async (isbn) => {
    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Add logging
        const bookData = data[`ISBN:${isbn}`];

        if (!bookData) {
            throw new Error('No book data found');
        }

        return {
            id: isbn,
            title: bookData.title || 'Unknown Title',
            author: bookData.authors ? bookData.authors.map(author => author.name).join(', ') : 'Unknown Author',
            publishedDate: bookData.publish_date || 'Unknown',
            pages: bookData.number_of_pages || 0,
            genre: bookData.subjects ? bookData.subjects.map(subject => subject.name).join(', ') : 'Unknown Genre',
            subject: bookData.subjects ? bookData.subjects[0].name : 'Unknown Subject',
            coverImage: bookData.cover ? bookData.cover.large : '',
            isbn: isbn,
            copies: 1
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
            publishedDate: book.first_publish_year ? new Date(book.first_publish_year, 0, 1) : null,
            pages: book.number_of_pages_median || 0,
            genre: book.subject_facet ? book.subject_facet[0] : 'Unknown',
            subject: book.subject ? book.subject[0] : 'Unknown',
            coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : '',
            isbn: book.isbn ? book.isbn[0] : 'N/A',
            copies: 1
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
            publishedDate: book.first_publish_year ? new Date(book.first_publish_year, 0, 1) : null,
            pages: book.number_of_pages_median || 0,
            genre: book.subject_facet ? book.subject_facet[0] : 'Unknown',
            subject: book.subject ? book.subject[0] : 'Unknown',
            coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : '',
            isbn: book.isbn ? book.isbn[0] : 'N/A',
            copies: 1
        };
    });
};

// New functions for managing user's books
export const addUserBook = async (book, copies, setNotification, setDialog, setUndoBook) => {
    const { title, author, publishedDate, pages, genre, subject, coverImage, isbn } = book;
    const [authorFirstName, authorLastName] = author.split(' ');

    const bookData = {
        title,
        authorFirstName,
        authorLastName,
        publishedDate,
        pages,
        genre,
        subject,
        coverImage,
        isbn,
        copies: parseInt(copies, 10) || 1,
    };

    try {
        const response = await fetch(`${apiUrl}/books/add`, {
            method: 'POST',
            headers: headersWithAuth(),
            body: JSON.stringify(bookData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Network response was not ok');
        }
        const newBook = await response.json();
        setUndoBook(newBook._id);
        setNotification({ show: true, message: `Book "${book.title}" added to the library!`, undo: true });
    } catch (err) {
        console.error('Failed to add book:', err);
        setNotification({ show: true, message: 'Failed to add book.', error: true });
    }
};


export const getUserBooks = async () => {
    const response = await fetch(`${apiUrl}/books/user-books`, {
        headers: headersWithAuth(),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

// export const fetchLibraryBooks = async () => {
//     const response = await fetch(`${apiUrl}/books`, {
//         headers: headersWithAuth(),
//     });
//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }
//     return await response.json();
// };

// export const addBookToLibrary = async (book, copies, setNotification, setDialog, setUndoBook) => {
//     const [authorFirstName, authorLastName] = (book.author || '').split(' ', 2);
//     const bookData = {
//         title: book.title || 'Unknown Title',
//         authorFirstName: authorFirstName || 'Unknown',
//         authorLastName: authorLastName || 'Unknown',
//         publishedDate: book.publishedDate || '',
//         pages: book.pages || 0,
//         genre: book.genre || 'Unknown',
//         subject: book.subject || 'Unknown',
//         coverImage: book.coverImage || '',
//         isbn: book.isbn || 'N/A',
//         copies: parseInt(copies, 10) || 1
//     };

//     try {
//         const existingBooks = await fetchLibraryBooks();
//         const existingBook = existingBooks.find(b =>
//             b.title.toLowerCase() === book.title.toLowerCase() &&
//             b.authorFirstName.toLowerCase() === authorFirstName.toLowerCase() &&
//             b.authorLastName.toLowerCase() === authorLastName.toLowerCase()
//         );

//         if (existingBook) {
//             setDialog({
//                 open: true,
//                 title: `The book "${book.title}" by ${book.author} already exists in the library.`,
//                 content: "How many additional copies would you like to add?",
//                 onConfirm: async (numberOfCopies) => {
//                     if (numberOfCopies && numberOfCopies > 0) {
//                         await updateBookCopies(existingBook._id, parseInt(existingBook.copies, 10) + parseInt(numberOfCopies, 10));
//                         setNotification({ show: true, message: `${numberOfCopies} copies of ${book.title} added to the library!` });
//                     }
//                 }
//             });
//         } else {
//             const newBook = await createBook(bookData);
//             setUndoBook(newBook._id);
//             setNotification({ show: true, message: `Book "${book.title}" added to the library!`, undo: true });
//         }
//     } catch (err) {
//         console.error('Failed to add book:', err);
//         setNotification({ show: true, message: 'Failed to add book.', error: true });
//     }
// };
