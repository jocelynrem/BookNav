// scripts/migrationScript.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const CheckoutRecord = require('../src/models/CheckoutRecord');

async function migrateData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all users
        const users = await User.find();
        console.log(`Found ${users.length} users`);

        // Find all books
        const books = await Book.find();
        console.log(`Found ${books.length} books`);

        // Migration logic here
        for (const user of users) {
            if (user.role === 'teacher') {
                for (const book of books) {
                    if (!user.books.includes(book._id)) {
                        user.books.push(book._id);
                    }
                }
                await user.save();
                console.log(`Updated books for teacher ${user.username} (ID: ${user._id})`);
            }
        }

        console.log('Data migration completed successfully');
    } catch (error) {
        console.error('Error during data migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrateData();
