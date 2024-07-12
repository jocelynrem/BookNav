const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // adjust this path as needed
const Student = require('../models/Student');
const User = require('../models/User');

let token;

beforeAll(async () => {
    // Create a test user and get a token
    const testUser = new User({
        username: 'testteacher',
        password: 'password123',
        role: 'teacher'
    });
    await testUser.save();

    const response = await request(app)
        .post('/api/auth/login')
        .send({
            username: 'testteacher',
            password: 'password123'
        });

    token = response.body.token;
});

afterAll(async () => {
    await User.deleteMany();
    await Student.deleteMany();
    await mongoose.connection.close();
});

describe('Student Routes', () => {
    test('GET /api/students should return all students', async () => {
        const response = await request(app)
            .get('/api/students')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('POST /api/students should create a new student', async () => {
        const newStudent = {
            firstName: 'John',
            lastName: 'Doe',
            studentId: '12345',
            grade: 10,
            pin: '1234'
        };

        const response = await request(app)
            .post('/api/students')
            .set('Authorization', `Bearer ${token}`)
            .send(newStudent);

        expect(response.statusCode).toBe(201);
        expect(response.body.firstName).toBe(newStudent.firstName);
    });

    test('POST /api/students/bulk-create should create multiple students', async () => {
        const studentsData = [
            { firstName: 'Jane', lastName: 'Doe', studentId: '12346', grade: 10, pin: '1234' },
            { firstName: 'Bob', lastName: 'Smith', studentId: '12347', grade: 11, pin: '5678' }
        ];

        const response = await request(app)
            .post('/api/students/bulk-create')
            .set('Authorization', `Bearer ${token}`)
            .send(studentsData);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(2);
        expect(response.body.failed).toBe(0);
    });

    test('PUT /api/students/:id should update a student', async () => {
        const student = new Student({
            firstName: 'Test',
            lastName: 'User',
            studentId: '12348',
            grade: 9,
            pin: '9876'
        });
        await student.save();

        const updatedData = {
            firstName: 'Updated',
            grade: 10
        };

        const response = await request(app)
            .put(`/api/students/${student._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedData);

        expect(response.statusCode).toBe(200);
        expect(response.body.firstName).toBe(updatedData.firstName);
        expect(response.body.grade).toBe(updatedData.grade);
    });

    test('DELETE /api/students/:id should delete a student', async () => {
        const student = new Student({
            firstName: 'Delete',
            lastName: 'Me',
            studentId: '12349',
            grade: 8,
            pin: '4321'
        });
        await student.save();

        const response = await request(app)
            .delete(`/api/students/${student._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Student deleted');

        const deletedStudent = await Student.findById(student._id);
        expect(deletedStudent).toBeNull();
    });
});