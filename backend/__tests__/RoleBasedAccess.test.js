// backend/__tests__/RoleBasedAccess.test.js
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Class = require('../src/models/Class');
const Student = require('../src/models/Student');
const mongoose = require('mongoose');

let teacherToken;
let studentPin;
let classId;

beforeAll(async () => {
    await User.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});

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
    console.log('Teacher registration response:', teacherResponse.body);
    expect(teacherResponse.statusCode).toEqual(201);

    const teacherLogin = await request(app)
        .post('/api/auth/login')
        .send({
            usernameOrEmail: teacherUsername,
            password: 'password123'
        });
    console.log('Teacher login response:', teacherLogin.body);
    expect(teacherLogin.statusCode).toEqual(200);
    teacherToken = teacherLogin.body.token;

    const classResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ name: 'Test Class', schoolYear: '2023-2024' });
    classId = classResponse.body._id;

    const studentResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
            firstName: 'Test',
            lastName: 'Student',
            studentId: `STUD_${Date.now()}`,
            grade: 10,
            classId: classId,
            pin: '1234'
        });
    expect(studentResponse.statusCode).toEqual(201);
    studentPin = studentResponse.body.pin;
});

describe('Role-Based Access Control', () => {
    it('should allow a teacher to access the classes list', async () => {
        const res = await request(app)
            .get('/api/classes')
            .set('Authorization', `Bearer ${teacherToken}`);

        console.log('Teacher classes access response:', res.body);
        expect(res.statusCode).toEqual(200);
    });

    it('should not allow a student to access the classes list', async () => {
        const res = await request(app)
            .get('/api/classes')
            .set('Authorization', `Bearer ${studentPin}`);

        console.log('Student classes access response:', res.body);
        expect(res.statusCode).toEqual(403);
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