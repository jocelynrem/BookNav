//backend/__tests__/StudentRoutes.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Class = require('../src/models/Class');
const CheckoutRecord = require('../src/models/CheckoutRecord');

let teacherToken;
let studentId;
let classId;

beforeAll(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Class.deleteMany({});
    await CheckoutRecord.deleteMany({});

    // Create a teacher user
    const teacher = await User.create({
        username: `testteacher_${Date.now()}`,
        email: `teacher_${Date.now()}@test.com`,
        password: 'password123',
        role: 'teacher'
    });

    // Login the teacher to get a token
    const teacherLogin = await request(app)
        .post('/api/auth/login')
        .send({ usernameOrEmail: teacher.username, password: 'password123' });
    teacherToken = teacherLogin.body.token;

    // Create a class
    const classResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ name: 'Test Class', schoolYear: '2023-2024' });
    classId = classResponse.body._id;

    // Create a student
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
    studentId = studentResponse.body._id;
});

describe('Student Routes', () => {
    it('should allow a teacher to create a student', async () => {
        const res = await request(app)
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

        console.log('Full response:', res.body);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.firstName).toEqual('Test');
        expect(res.body.lastName).toEqual('Student');
        expect(res.body.pin).toEqual('1234');
        studentId = res.body._id; // Capture studentId for later use
    });

    it('should allow a teacher to update a student', async () => {
        const res = await request(app)
            .put(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                grade: 11,
                pin: '4321'
            });

        console.log('Full response:', res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.grade).toEqual(11);
        expect(res.body.pin).toEqual('4321');
    });

    it('should allow a teacher to delete a student', async () => {
        const res = await request(app)
            .delete(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${teacherToken}`);

        console.log(res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Student deleted');
    });

    it('should allow retrieving student reading history', async () => {
        const res = await request(app)
            .get(`/api/students/${studentId}/reading-history`)
            .set('Authorization', `Bearer ${teacherToken}`);

        console.log('Full response:', res.body);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    // New test for bulk-create endpoint
    it('should allow a teacher to bulk create students', async () => {
        const studentsData = [
            {
                firstName: 'Bulk1',
                lastName: 'Student1',
                studentId: `STUD_BULK_${Date.now()}_1`,
                grade: 9,
                classId: classId,
                pin: '1111'
            },
            {
                firstName: 'Bulk2',
                lastName: 'Student2',
                studentId: `STUD_BULK_${Date.now()}_2`,
                grade: 10,
                classId: classId,
                pin: '2222'
            }
        ];

        const res = await request(app)
            .post('/api/students/bulk-create')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(studentsData);

        console.log('Bulk create response:', res.body);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('success');
        expect(res.body).toHaveProperty('failed');
        expect(res.body.success).toEqual(2);
        expect(res.body.failed).toEqual(0);
    });
});

afterAll(async () => {
    try {
        await User.deleteMany({});
        await Student.deleteMany({});
        await Class.deleteMany({});
        await CheckoutRecord.deleteMany({});
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
    }
});