// scripts/correctDataAssociation.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const BookCopy = require('../src/models/BookCopy');
const CheckoutRecord = require('../src/models/CheckoutRecord');
const Class = require('../src/models/Class');
const Student = require('../src/models/Student');

async function correctDataAssociation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const classes = await Class.find();
        console.log(`Found ${classes.length} classes:`);
        classes.forEach(c => console.log(`- ${c.name} (ID: ${c._id}), Teacher: ${c.teacher}`));

        const users = await User.find({ role: 'teacher' });
        console.log(`Found ${users.length} teachers`);

        const books = await Book.find();
        console.log(`Found ${books.length} books`);

        const students = await Student.find();
        console.log(`Found ${students.length} students`);

        const checkoutRecords = await CheckoutRecord.find();
        console.log(`Found ${checkoutRecords.length} checkout records`);

        let totalAssociations = 0;

        for (const book of books) {
            const bookCopies = await BookCopy.find({ book: book._id });
            const relevantCheckouts = await CheckoutRecord.find({
                bookCopy: { $in: bookCopies.map(copy => copy._id) }
            }).populate('student');

            const classIds = [...new Set(relevantCheckouts.map(record =>
                record.student ? record.student.class.toString() : null
            ).filter(id => id !== null))];

            for (const classId of classIds) {
                const classDoc = await Class.findById(classId);
                if (classDoc) {
                    if (!classDoc.books) {
                        classDoc.books = [];
                    }
                    if (!classDoc.books.includes(book._id)) {
                        classDoc.books.push(book._id);
                        await classDoc.save();
                        console.log(`Associated book ${book.title} (ID: ${book._id}) with class ${classDoc.name} (ID: ${classDoc._id})`);
                        totalAssociations++;

                        // Associate book with teacher
                        const teacher = await User.findById(classDoc.teacher);
                        if (teacher && !teacher.books.includes(book._id)) {
                            if (!teacher.books) {
                                teacher.books = [];
                            }
                            teacher.books.push(book._id);
                            await teacher.save();
                            console.log(`Associated book ${book.title} (ID: ${book._id}) with teacher ${teacher.username} (ID: ${teacher._id})`);
                        }
                    }
                } else {
                    console.log(`Class not found for ID: ${classId}`);
                }
            }
        }

        console.log(`Book associations completed. Total new associations: ${totalAssociations}`);
    } catch (error) {
        console.error('Error during data association:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

correctDataAssociation();