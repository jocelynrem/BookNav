// scripts/migrateBookAuthors.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Use the correct path to the Book model
const Book = require(path.join(__dirname, '..', 'src', 'models', 'Book'));

async function migrateBookAuthors() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected successfully');

        const books = await Book.find({});
        console.log(`Found ${books.length} books to process`);

        let updatedCount = 0;
        for (let book of books) {
            if (book.authorFirstName || book.authorLastName) {
                book.author = `${book.authorFirstName || ''} ${book.authorLastName || ''}`.trim();
                book.authorFirstName = undefined;
                book.authorLastName = undefined;
                await book.save();
                updatedCount++;
                if (updatedCount % 100 === 0) {
                    console.log(`Processed ${updatedCount} books`);
                }
            }
        }

        console.log(`Migration completed successfully. Updated ${updatedCount} books.`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

migrateBookAuthors();