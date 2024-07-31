const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const BookCopy = require('../src/models/BookCopy');
const CheckoutRecord = require('../src/models/CheckoutRecord');
const Student = require('../src/models/Student');
const Class = require('../src/models/Class');

async function migrateCopies() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const bookCopies = await BookCopy.find({ user: { $exists: false } });
        console.log(`Found ${bookCopies.length} BookCopy documents without user field`);

        for (const copy of bookCopies) {
            const book = await Book.findById(copy.book);
            if (!book) {
                console.log(`Book not found for copy ${copy._id}, skipping`);
                continue;
            }

            const user = await User.findOne({ books: book._id });
            if (!user) {
                console.log(`No user found for book ${book._id}, skipping copy ${copy._id}`);
                continue;
            }

            copy.user = user._id;
            await copy.save();
            console.log(`Updated copy ${copy._id} with user ${user._id}`);
        }

        console.log('Migration completed');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrateCopies();