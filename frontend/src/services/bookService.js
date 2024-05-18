const apiUrl = 'http://localhost:3000/api/books';

export const getBooks = async () => {
    const response = await fetch(apiUrl);
    return await response.json();
};

export const getBookById = async (id) => {
    const response = await fetch(`${apiUrl}/${id}`);
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
    return await response.json();
};

export const deleteBook = async (id) => {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
    });
    return await response.json();
};
