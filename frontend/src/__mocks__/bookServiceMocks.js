// frontend/src/__mocks__/bookServiceMocks.js

export const mockBooks = [
    {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        publishedDate: new Date(),
        pages: 100,
        genre: 'Fiction',
        subject: 'Test Subject',
        coverImage: 'http://example.com/cover.jpg',
        isbn: '1234567890',
        copies: 1,
    },
];

export const mockNewBook = {
    id: 2,
    title: 'New Book',
    author: 'New Author',
    publishedDate: new Date(),
    pages: 200,
    genre: 'Non-Fiction',
    subject: 'New Subject',
    coverImage: 'http://example.com/newcover.jpg',
    isbn: '0987654321',
    copies: 1,
};
