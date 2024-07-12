// backend/__tests__/CheckoutRoutes.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Class = require('../src/models/Class');
const CheckoutRecord = require('../src/models/CheckoutRecord');
const BookCopy = require('../src/models/BookCopy');

let teacherToken;
let studentId;
let classId;
let bookCopyId;
let checkoutId;

beforeAll(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Class.deleteMany({});
    await CheckoutRecord.deleteMany({});
    await BookCopy.deleteMany({});

    const teacher = await User.create({
        username: `testteacher_${Date.now()}`,
        email: `teacher_${Date.now()}@test.com`,
        password: 'password123',
        role: 'teacher'
    });

    const teacherLogin = await request(app).post('/api/auth/login').send({ usernameOrEmail: teacher.username, password: 'password123' });
    teacherToken = teacherLogin.body.token;
    console.log('Teacher Token:', teacherToken);

    const classResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ name: 'Test Class', schoolYear: '2023-2024' });
    classId = classResponse.body._id;
    console.log('Created Class ID:', classId);

    const studentResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
            firstName: 'Test',
            lastName: 'Student',
            studentId: `STUD_${Date.now()}`,
            grade: 10,
            class: classId,
            pin: '1234'
        });
    studentId = studentResponse.body._id;
    console.log('Created Student ID:', studentId);

    const bookCopyResponse = await BookCopy.create({
        book: new mongoose.Types.ObjectId(),
        condition: 'new'
    });
    bookCopyId = bookCopyResponse._id;
    console.log('Created BookCopy ID:', bookCopyId);
});

afterAll(async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        await User.deleteMany({});
        await Student.deleteMany({});
        await Class.deleteMany({});
        await CheckoutRecord.deleteMany({});
        await BookCopy.deleteMany({});
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
    }
});

describe('Checkout Routes', () => {
    it('should allow checking out a book for a student', async () => {
        const res = await request(app)
            .post('/api/checkouts')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                studentId: studentId,
                bookCopyId: bookCopyId,
                dueDate: '2024-12-31'
            });

        console.log('Checkout Response:', res.body);
        expect(res.statusCode).toEqual(201);
        checkoutId = res.body._id;
        console.log('Created Checkout ID:', checkoutId);
    });

    it('should allow returning a book', async () => {
        console.log('Attempting to return book with checkout ID:', checkoutId);

        const res = await request(app)
            .put(`/api/checkouts/${checkoutId}/return`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                returnedOn: '2024-12-15'
            });

        console.log('Return Response:', res.body);
        console.log('Return Status Code:', res.statusCode);
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('returned');
    });
});
