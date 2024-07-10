const mongoose = require('mongoose');
const path = require('path');
const Book = require(path.join(__dirname, 'src', 'models', 'Book'));
const BookCopy = require(path.join(__dirname, 'src', 'models', 'BookCopy'));
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

async function migrateDatabase() {
    try {
        const books = await Book.find({});
        console.log(`Found ${books.length} books to update`);

        for (let book of books) {
            try {
                console.log(`Updating book: ${book.title}`);

                // Add new fields
                book.readingLevel = book.readingLevel || 'Not Set';
                book.lexileScore = book.lexileScore || 0;
                book.arPoints = book.arPoints || 0;

                await book.save();

                // Create BookCopy records for each book
                for (let i = 1; i <= book.copies; i++) {
                    console.log(`Creating copy ${i} for book: ${book.title}`);
                    await BookCopy.create({
                        book: book._id,
                        copyNumber: i,
                        status: book.availableCopies >= i ? 'available' : 'checked out',
                        condition: 'good'
                    });
                }
            } catch (bookError) {
                console.error(`Error updating book ${book.title}:`, bookError.message);
            }
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrateDatabase();