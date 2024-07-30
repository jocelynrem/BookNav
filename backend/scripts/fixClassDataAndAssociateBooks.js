// scripts/fixClassDataAndAssociateBooks.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const BookCopy = require('../src/models/BookCopy');
const CheckoutRecord = require('../src/models/CheckoutRecord');
const Class = require('../src/models/Student');

async function fixClassDataAndAssociateBooks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Check and fix class data
        const classes = await Class.find();
        console.log(`Found ${classes.length} classes`);

        const users = await User.find({ role: 'teacher' });
        console.log(`Found ${users.length} teachers`);

        if (users.length === 0) {
            console.log('No teachers found. Please create teacher accounts first.');
            return;
        }

        for (const cls of classes) {
            if (!cls.teacher) {
                cls.teacher = users[0]._id; // Assign to the first teacher if none is set
                await cls.save();
                console.log(`Assigned teacher to class ${cls._id}`);
            }
        }

        // 2. Associate books with classes and teachers
        const books = await Book.find();
        console.log(`Found ${books.length} books`);

        let totalAssociations = 0;

        for (const book of books) {
            const bookCopies = await BookCopy.find({ book: book._id });
            const checkoutRecords = await CheckoutRecord.find({
                bookCopy: { $in: bookCopies.map(copy => copy._id) }
            }).populate('student');

            const classIds = [...new Set(checkoutRecords.map(record =>
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
                        console.log(`Associated book ${book.title} (ID: ${book._id}) with class ${classDoc._id}`);
                        totalAssociations++;

                        // Associate book with teacher
                        const teacher = await User.findById(classDoc.teacher);
                        if (teacher && !teacher.books.includes(book._id)) {
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
        console.error('Error during class data fix and book association:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixClassDataAndAssociateBooks();