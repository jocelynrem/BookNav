// scripts/migrateBookAssociations.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const BookCopy = require('../src/models/BookCopy');
const CheckoutRecord = require('../src/models/CheckoutRecord');
const Student = require('../src/models/Student');
const Class = require('../src/models/Class');


async function migrateBookAssociations() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }

        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        mongoose.model('User', User.schema);
        mongoose.model('Book', Book.schema);
        mongoose.model('BookCopy', BookCopy.schema);
        mongoose.model('CheckoutRecord', CheckoutRecord.schema);
        mongoose.model('Student', Student.schema);
        mongoose.model('Class', Class.schema);

        const books = await Book.find();
        console.log(`Found ${books.length} books`);

        const totalCheckoutRecords = await CheckoutRecord.countDocuments();
        console.log(`Total checkout records in the database: ${totalCheckoutRecords}`);

        const users = await User.find();
        console.log(`Found ${users.length} users`);

        let totalAssociations = 0;

        for (const book of books) {
            const bookCopies = await BookCopy.find({ book: book._id });
            console.log(`Book: ${book.title} (ID: ${book._id}) has ${bookCopies.length} copies`);

            const checkoutRecords = await CheckoutRecord.find({
                bookCopy: { $in: bookCopies.map(copy => copy._id) }
            }).populate('student');

            console.log(`Found ${checkoutRecords.length} checkout records for this book`);

            const classIds = [...new Set(checkoutRecords.map(record =>
                record.student ? record.student.class.toString() : null
            ).filter(id => id !== null))];

            console.log(`Processing book: ${book.title} (ID: ${book._id})`);
            console.log(`Found ${classIds.length} unique classes for this book`);

            for (const classId of classIds) {
                const classDoc = await Class.findById(classId).populate('teacher');
                if (classDoc && classDoc.teacher) {
                    const user = users.find(u => u._id.toString() === classDoc.teacher._id.toString());
                    if (user) {
                        if (!user.books.includes(book._id)) {
                            user.books.push(book._id);
                            await user.save();
                            console.log(`Associated book ${book.title} (ID: ${book._id}) with user ${user.username} (ID: ${user._id})`);
                            totalAssociations++;
                        } else {
                            console.log(`Book ${book.title} (ID: ${book._id}) already associated with user ${user.username} (ID: ${user._id})`);
                        }
                    } else {
                        console.log(`No user found for teacher (ID: ${classDoc.teacher._id}) of class ${classDoc._id}`);
                    }
                } else {
                    console.log(`No teacher found for class ${classId}`);
                }
            }
        }

        console.log(`Book associations migration completed successfully. Total new associations: ${totalAssociations}`);
    } catch (error) {
        console.error('Error during book associations migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrateBookAssociations();