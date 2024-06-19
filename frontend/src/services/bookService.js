const apiUrl = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_API_URL;

export const getBooks = async () => {
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const createBook = async (book) => {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const updateBook = async (id, book) => {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const deleteBook = async (id) => {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export const fetchBookByISBN = async (isbn) => {
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    if (!response.ok) {
        throw new Error('Failed to fetch book details');
    }
    const data = await response.json();
    return data[`ISBN:${isbn}`];
};

export const fetchBooksByTitle = async (title) => {
    const response = await fetch(`https://openlibrary.org/search.json?title=${title}`);
    if (!response.ok) {
        throw new Error('Failed to fetch books');
    }
    const data = await response.json();
    return data.docs.map(book => ({
        id: book.key,
        title: book.title,
        author: book.author_name ? book.author_name.join(', ') : 'Unknown',
        coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null
    }));
};

export const fetchBooksByAuthor = async (author) => {
    const response = await fetch(`https://openlibrary.org/search.json?author=${author}`);
    if (!response.ok) {
        throw new Error('Failed to fetch books');
    }
    const data = await response.json();
    return data.docs.map(book => ({
        id: book.key,
        title: book.title,
        author: book.author_name ? book.author_name.join(', ') : 'Unknown',
        coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
    }));
};


