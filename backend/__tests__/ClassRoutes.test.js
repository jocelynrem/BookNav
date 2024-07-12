// backend/__tests__/ClassRoutes.test.js
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Class = require('../src/models/Class');
const Student = require('../src/models/Student');
const mongoose = require('mongoose');

let teacherToken, studentPin;

beforeEach(async () => {
    await User.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});

    const teacher = await User.create({
        username: `testteacher_${Date.now()}`,
        email: `teacher_${Date.now()}@test.com`,
        password: 'password123',
        role: 'teacher'
    });

    const teacherLogin = await request(app)
        .post('/api/auth/login')
        .send({ usernameOrEmail: teacher.username, password: 'password123' });
    teacherToken = teacherLogin.body.token;

    const student = await Student.create({
        firstName: 'Test',
        lastName: 'Student',
        studentId: `STUD_${Date.now()}`,
        grade: 10,
        pin: '1234'
    });
    studentPin = student.pin;
});

describe('Class Routes', () => {
    it('should allow a teacher to create a class', async () => {
        const res = await request(app)
            .post('/api/classes')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                name: 'Test Class',
                schoolYear: '2023-2024'
            });

        if (res.status !== 201) {
            console.log('Unexpected response:', res.status, res.body);
        }
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toEqual('Test Class');
    });

    it('should not allow a student to create a class', async () => {
        const res = await request(app)
            .post('/api/classes')
            .set('Authorization', `Bearer ${studentPin}`)
            .send({
                name: 'Student Class',
                schoolYear: '2023-2024'
            });

        if (res.status !== 403) {
            console.log('Unexpected response:', res.status, res.body);
        }
        expect(res.statusCode).toEqual(403);
    });

    it('should allow a teacher to update a class', async () => {
        const createRes = await request(app)
            .post('/api/classes')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                name: 'Initial Test Class',
                schoolYear: '2023-2024'
            });

        const res = await request(app)
            .put(`/api/classes/${createRes.body._id}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ name: 'Updated Test Class' });

        if (res.status !== 200) {
            console.log('Unexpected response:', res.status, res.body);
        }
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Updated Test Class');
    });

    it('should allow a teacher to delete a class', async () => {
        const createRes = await request(app)
            .post('/api/classes')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                name: 'Initial Test Class',
                schoolYear: '2023-2024'
            });

        const res = await request(app)
            .delete(`/api/classes/${createRes.body._id}`)
            .set('Authorization', `Bearer ${teacherToken}`);

        if (res.status !== 200) {
            console.log('Unexpected response:', res.status, res.body);
        }
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Class deleted');
    });
});

afterAll(async () => {
    try {
        await User.deleteMany({});
        await Student.deleteMany({});
        await Class.deleteMany({});
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
    }
});