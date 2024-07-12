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

                // Handle missing author field
                if (!book.author) {
                    if (book.authorFirstName || book.authorLastName) {
                        book.author = `${book.authorFirstName || ''} ${book.authorLastName || ''}`.trim();
                    } else {
                        book.author = 'Unknown Author';
                    }
                }

                // Add new fields if they don't exist
                book.readingLevel = book.readingLevel || 'Not Set';
                book.lexileScore = book.lexileScore || 0;
                book.arPoints = book.arPoints || 0;

                // Ensure createdAt and updatedAt are set
                if (!book.createdAt) book.createdAt = new Date();
                book.updatedAt = new Date();

                // Remove old author fields if they exist
                book.authorFirstName = undefined;
                book.authorLastName = undefined;

                await book.save();

                // Get existing BookCopy records for this book
                const existingCopies = await BookCopy.countDocuments({ book: book._id });

                // Create additional BookCopy records if needed
                for (let i = existingCopies + 1; i <= book.copies; i++) {
                    console.log(`Creating copy ${i} for book: ${book.title}`);
                    await BookCopy.create({
                        book: book._id,
                        copyNumber: i,
                        status: 'available',
                        condition: 'good'
                    });
                }

                // Remove availableCopies and checkedOutCopies fields if they exist
                await Book.updateOne(
                    { _id: book._id },
                    { $unset: { availableCopies: "", checkedOutCopies: "" } }
                );

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