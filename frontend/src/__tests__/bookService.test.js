//frontend/src/__tests__/bookService.test.js
import {
    getBooks,
    createBook,
    updateBook,
    deleteBook,
    fetchBookByISBN,
    fetchBooksByTitle,
    fetchBooksByAuthor,
    addUserBook,
    getUserBooks
} from '../services/bookService';
import { mockBooks, mockNewBook } from '../__mocks__/bookServiceMocks';

jest.mock('../services/bookService', () => ({
    ...jest.requireActual('../services/bookService'),
    getUserBooks: jest.fn(),
    createBook: jest.fn(),
    fetchBookByISBN: jest.fn(),
    addUserBook: jest.fn(),
}));

global.fetch = jest.fn();

describe('bookService', () => {
    beforeEach(() => {
        fetch.mockClear();
        jest.clearAllMocks();
        getUserBooks.mockClear();
        global.setNotification = jest.fn(); // Mock setNotification globally
    });

    const mockSetNotification = jest.fn();
    const mockSetDialog = jest.fn();
    const mockSetUndoBook = jest.fn();

    test('getBooks fetches books successfully', async () => {
        console.log('Mocking fetch for getBooks');
        const mockBooks = [{ id: 1, title: 'Test Book' }];
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockBooks,
        });

        const books = await getBooks();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/books/user-books'), expect.any(Object));
        expect(books).toEqual(mockBooks);
    });

    test('getBooks handles errors', async () => {
        console.log('Mocking fetch rejection for getBooks');
        fetch.mockRejectedValueOnce(new Error('API is down'));

        await expect(getBooks()).rejects.toThrow('API is down');
    });

    test('createBook creates a book successfully', async () => {
        const mockBook = { title: 'New Book', author: 'Author Name' };
        const mockResponse = { ...mockBook, id: 1 };
        createBook.mockResolvedValueOnce(mockResponse);

        const createdBook = await createBook(mockBook);

        expect(createBook).toHaveBeenCalledTimes(1);
        expect(createBook).toHaveBeenCalledWith(mockBook);
        expect(createdBook).toEqual(mockResponse);
    });

    test('createBook handles errors', async () => {
        createBook.mockRejectedValue(new Error('Failed to create book'));
        await expect(createBook({})).rejects.toThrow('Failed to create book');
    });

    test('updateBook updates a book successfully', async () => {
        const mockBook = { title: 'Updated Book', author: 'Updated Author' };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockBook,
        });

        const updatedBook = await updateBook(1, mockBook);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/books/1'),
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify(mockBook),
            })
        );
        expect(updatedBook).toEqual(mockBook);
    });

    test('updateBook handles errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Failed to update book'));

        await expect(updateBook(1, {})).rejects.toThrow('Failed to update book');
    });

    test('deleteBook deletes a book successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Book deleted' }),
        });

        const response = await deleteBook(1);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/books/1'), {
            method: 'DELETE',
            headers: expect.any(Object),
        });
        expect(response).toEqual({ message: 'Book deleted' });
    });

    test('deleteBook handles errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Failed to delete book'));

        await expect(deleteBook(1)).rejects.toThrow('Failed to delete book');
    });

    test('fetchBookByISBN fetches a book by ISBN successfully', async () => {
        const mockBook = {
            ISBN: '1234567890',
            title: 'Test Book',
            authors: [{ name: 'Test Author' }],
        };
        fetchBookByISBN.mockResolvedValueOnce({
            id: '1234567890',
            title: 'Test Book',
            author: 'Test Author',
        });

        const book = await fetchBookByISBN('1234567890');

        expect(fetchBookByISBN).toHaveBeenCalledTimes(1);
        expect(fetchBookByISBN).toHaveBeenCalledWith('1234567890');
        expect(book).toEqual(expect.objectContaining({
            id: '1234567890',
            title: 'Test Book',
            author: 'Test Author',
        }));
    });

    test('fetchBooksByTitle handles errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Failed to fetch books'));

        await expect(fetchBooksByTitle('Test')).rejects.toThrow('Failed to fetch books');
    });

    test('fetchBooksByTitle fetches books by title successfully', async () => {
        const mockBooks = [
            { title: 'Test Book 1', author_name: ['Author 1'] },
            { title: 'Test Book 2', author_name: ['Author 2'] },
        ];
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ docs: mockBooks }),
        });

        const books = await fetchBooksByTitle('Test');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('title=Test'));
        expect(books).toEqual(expect.arrayContaining([
            expect.objectContaining({ title: 'Test Book 1', author: 'Author 1' }),
            expect.objectContaining({ title: 'Test Book 2', author: 'Author 2' }),
        ]));
    });

    test('fetchBooksByTitle handles errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Failed to fetch books'));

        await expect(fetchBooksByTitle('Test')).rejects.toThrow('Failed to fetch books');
    });

    test('fetchBooksByAuthor fetches books by author successfully', async () => {
        const mockBooks = [
            { title: 'Test Book 1', author_name: ['Author 1'] },
            { title: 'Test Book 2', author_name: ['Author 2'] },
        ];
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ docs: mockBooks }),
        });

        const books = await fetchBooksByAuthor('Author');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('author=Author'));
        expect(books).toEqual(expect.arrayContaining([
            expect.objectContaining({ title: 'Test Book 1', author: 'Author 1' }),
            expect.objectContaining({ title: 'Test Book 2', author: 'Author 2' }),
        ]));
    });

    test('fetchBooksByAuthor handles errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Failed to fetch books'));

        await expect(fetchBooksByAuthor('Author')).rejects.toThrow('Failed to fetch books');
    });

    test('addUserBook adds a user book successfully', async () => {
        getUserBooks.mockResolvedValue(mockBooks);
        addUserBook.mockImplementation(async (book, copies, setNotification, setDialog, setUndoBook) => {
            await getUserBooks();
            const newBook = { ...book, id: mockBooks.length + 1 };
            setUndoBook(newBook);
            setNotification({ show: true, message: `Book "${book.title}" added to your library!`, undo: true });
            return Promise.resolve(newBook);
        });

        const addedBook = await addUserBook(mockNewBook, 1, mockSetNotification, mockSetDialog, mockSetUndoBook);

        expect(getUserBooks).toHaveBeenCalledTimes(1);
        expect(mockSetNotification).toHaveBeenCalledWith({
            show: true,
            message: `Book "${mockNewBook.title}" added to your library!`,
            undo: true
        });
        expect(mockSetUndoBook).toHaveBeenCalledWith(expect.objectContaining(mockNewBook));
        expect(addedBook).toEqual(expect.objectContaining({ ...mockNewBook }));
    });

    test('addUserBook handles errors', async () => {
        addUserBook.mockImplementation(() => {
            mockSetNotification({ show: true, message: 'Failed to add book.', error: true });
            return Promise.reject(new Error('Failed to add book'));
        });

        await expect(addUserBook(mockNewBook, 1, mockSetNotification, mockSetDialog, mockSetUndoBook)).rejects.toThrow('Failed to add book');
        expect(mockSetNotification).toHaveBeenCalledWith({ show: true, message: 'Failed to add book.', error: true });
    });

    test('getUserBooks fetches user books successfully', async () => {
        getUserBooks.mockResolvedValue(mockBooks);

        const books = await getUserBooks();

        expect(getUserBooks).toHaveBeenCalledTimes(1);
        expect(books).toEqual(mockBooks);
    });

    test('getUserBooks handles errors', async () => {
        getUserBooks.mockRejectedValue(new Error('API is down'));

        await expect(getUserBooks()).rejects.toThrow('API is down');
    });
});
