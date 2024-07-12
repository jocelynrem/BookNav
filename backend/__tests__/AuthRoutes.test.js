// backend/__tests__/AuthRoutes.test.js
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const mongoose = require('mongoose');

beforeEach(async () => {
    await User.deleteMany({});
});

describe('Auth Routes', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'teacher'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should login a user', async () => {
        // First register a user
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'teacher'
            });

        // Then try to login
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                usernameOrEmail: 'testuser',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});

afterAll(async () => {
    try {
        await User.deleteMany({});
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
    }
});