const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/books';

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
