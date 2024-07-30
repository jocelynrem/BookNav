// scripts/studentDataCleanup.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const BookCopy = require('../src/models/BookCopy');
const CheckoutRecord = require('../src/models/CheckoutRecord');
const Class = require('../src/models/Class');
const Student = require('../src/models/Student');

async function studentDataCleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'teacher' });
        console.log(`Found ${users.length} teachers`);

        const classes = await Class.find();
        console.log(`Found ${classes.length} classes`);

        const students = await Student.find();
        console.log(`Found ${students.length} students`);

        const checkoutRecords = await CheckoutRecord.find().populate('student');
        console.log(`Found ${checkoutRecords.length} checkout records`);

        let orphanedRecords = 0;
        let fixedRecords = 0;

        for (const record of checkoutRecords) {
            if (!record.student) {
                console.log(`Checkout record ${record._id} has no associated student`);
                orphanedRecords++;
                continue;
            }

            const studentClass = await Class.findById(record.student.class);
            if (!studentClass) {
                console.log(`Student ${record.student._id} has invalid class ID: ${record.student.class}`);
                // Find a valid class for this student
                const validClass = classes[0]; // Assign to the first class as a fallback
                record.student.class = validClass._id;
                await record.student.save();
                console.log(`Assigned student ${record.student._id} to class ${validClass._id}`);
                fixedRecords++;
            }
        }

        console.log(`Orphaned records: ${orphanedRecords}`);
        console.log(`Fixed records: ${fixedRecords}`);

        // Now, let's ensure all students are associated with a valid class and teacher
        for (const student of students) {
            const studentClass = await Class.findById(student.class);
            if (!studentClass) {
                console.log(`Student ${student._id} has invalid class ID: ${student.class}`);
                // Find a valid class for this student
                const validClass = classes[0]; // Assign to the first class as a fallback
                student.class = validClass._id;
                await student.save();
                console.log(`Assigned student ${student._id} to class ${validClass._id}`);
            }
        }

        console.log('Student data cleanup completed');
    } catch (error) {
        console.error('Error during student data cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

studentDataCleanup();