// backend/__tests__/BookRoutes.test.js
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const mongoose = require('mongoose');

let teacherToken;
let bookId;

beforeAll(async () => {
    await User.deleteMany({});
    await Book.deleteMany({});

    // Register and login a teacher user
    const teacherUsername = `teacher_${Date.now()}`;
    const teacherEmail = `teacher_${Date.now()}@example.com`;

    const teacherResponse = await request(app)
        .post('/api/auth/register')
        .send({
            username: teacherUsername,
            email: teacherEmail,
            password: 'password123',
            role: 'teacher'
        });
    expect(teacherResponse.statusCode).toEqual(201);

    const teacherLogin = await request(app)
        .post('/api/auth/login')
        .send({
            usernameOrEmail: teacherUsername,
            password: 'password123'
        });
    expect(teacherLogin.statusCode).toEqual(200);
    teacherToken = teacherLogin.body.token;
});

describe('Book Routes', () => {
    it('should create a new book', async () => {
        const bookData = {
            title: 'Test Book',
            author: 'Test Author',
            publishedDate: '2024-01-01',
            pages: 100,
            genre: 'Test Genre',
            subject: 'Test Subject',
            coverImage: 'http://example.com/image.jpg',
            isbn: '1234567890',
            copies: 10
        };

        const res = await request(app)
            .post('/api/books')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(bookData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual(bookData.title);
        bookId = res.body._id;
    });

    it('should get all books', async () => {
        const res = await request(app)
            .get('/api/books')
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get a book by id', async () => {
        const res = await request(app)
            .get(`/api/books/${bookId}`)
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id).toEqual(bookId);
    });

    it('should update a book by id', async () => {
        const updates = {
            pages: 150
        };

        const res = await request(app)
            .patch(`/api/books/${bookId}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(updates);

        expect(res.statusCode).toEqual(200);
        expect(res.body.pages).toEqual(updates.pages);
    });

    it('should update book copies', async () => {
        const updates = {
            copies: 20
        };

        const res = await request(app)
            .patch(`/api/books/${bookId}/updateCopies`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(updates);

        expect(res.statusCode).toEqual(200);
        expect(res.body.copies).toEqual(updates.copies);
    });

    it('should delete a book by id', async () => {
        const res = await request(app)
            .delete(`/api/books/${bookId}`)
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id).toEqual(bookId);
    });
});

afterAll(async () => {
    try {
        await User.deleteMany({});
        await Book.deleteMany({});
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
    }
});
