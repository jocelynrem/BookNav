// backend/src/routes/books.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const CheckoutRecord = require('../models/CheckoutRecord');


router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const books = await Book.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } },
                { isbn: { $regex: q, $options: 'i' } }
            ]
        }).limit(20);

        // Calculate available copies for each book
        const booksWithAvailability = await Promise.all(books.map(async book => {
            const totalCopies = await BookCopy.countDocuments({ book: book._id });
            const checkedOutCount = await CheckoutRecord.countDocuments({
                bookCopy: { $in: (await BookCopy.find({ book: book._id })).map(copy => copy._id) },
                status: 'checked out'
            });

            const availableCopies = totalCopies - checkedOutCount;

            return {
                ...book.toObject(),
                availableCopies
            };
        }));

        res.json(booksWithAvailability);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Error searching books', error: error.message });
    }
});

// Add a book to user's collection
router.post('/add', authenticateToken, roleAuth(['teacher']), async (req, res) => {
    try {
        const { title, author, publishedDate, pages, genre, subject, coverImage, isbn, copies } = req.body;
        const userId = req.user.id;

        let book = await Book.findOne({ title, author });

        if (book) {
            const newCopiesCount = book.copies + copies;
            for (let i = book.copies + 1; i <= newCopiesCount; i++) {
                const newCopy = new BookCopy({
                    book: book._id,
                    copyNumber: i,
                });
                await newCopy.save();
            }
            book.copies = newCopiesCount;
            book.availableCopies += copies;
            await book.save();
        } else {
            book = new Book({
                title,
                author,
                publishedDate,
                pages,
                genre,
                subject,
                coverImage,
                isbn,
                copies,
                availableCopies: copies,
            });

            await book.save();

            for (let i = 1; i <= copies; i++) {
                const newCopy = new BookCopy({
                    book: book._id,
                    copyNumber: i,
                });
                await newCopy.save();
            }
        }

        const user = await User.findById(userId);
        user.books.push(book);
        await user.save();

        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/add-copies', authenticateToken, roleAuth('teacher'), async (req, res) => {
    const { bookId, numberOfCopies } = req.body;
    try {
        if (!bookId || !numberOfCopies || numberOfCopies <= 0) {
            return res.status(400).json({ message: 'Invalid bookId or numberOfCopies' });
        }
        const result = await addBookCopies(bookId, numberOfCopies);
        res.status(200).json(result.book);
    } catch (error) {
        console.error('Error adding book copies:', error);
        res.status(400).json({ message: error.message });
    }
});

const addBookCopies = async (bookId, numberOfCopies) => {
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        const newCopies = [];
        for (let i = 0; i < numberOfCopies; i++) {
            const newCopy = new BookCopy({
                book: bookId,
                status: 'available',
                copyNumber: book.copies + i + 1
            });
            await newCopy.save();
            newCopies.push(newCopy);
        }

        book.copies += numberOfCopies;
        book.availableCopies += numberOfCopies;
        await book.save();

        return { book: await Book.findById(bookId).populate('copies'), newCopies };
    } catch (error) {
        throw error;
    }
};

// Create a new book
router.post('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { title, authors, publishedDate, pageCount, categories, thumbnail, description, isbn, copies } = req.body;

        if (!title || !authors) {
            return res.status(400).send('Title and Authors are required');
        }

        const book = new Book({
            title,
            authors,
            publishedDate,
            pageCount,
            categories,
            thumbnail,
            description,
            isbn,
            copies: copies || 1,
            availableCopies: copies || 1,
            checkedOutCopies: 0
        });

        await book.save();

        // Create BookCopy instances
        for (let i = 0; i < book.copies; i++) {
            const bookCopy = new BookCopy({
                book: book._id,
                status: 'available',
                copyNumber: i + 1
            });
            await bookCopy.save();
        }

        // Add the book to the user's library
        const user = await User.findById(req.user.id);
        user.books.push(book._id);
        await user.save();

        res.status(201).send(book);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(400).send(error.message);
    }
});

// Get all books for a user
router.get('/user-books', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('books');
        res.status(200).json(user.books);
    } catch (err) {
        console.error('Error in /user-books route:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all books
router.get('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).send(books);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a book by id
router.get('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send();
        }
        res.status(200).send(book);
    } catch (error) {
        res.status(500).send(error);
    }
});

// PATCH /:id - Update a book by ID
router.patch('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.copies !== undefined && updates.copies < 1) {
            return res.status(400).send({ error: 'Copies must be 1 or more.' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).send({ error: 'Book not found.' });
        }

        Object.keys(updates).forEach(update => book[update] = updates[update]);

        if (updates.copies !== undefined) {
            book.availableCopies = updates.copies - book.checkedOutCopies;
        }

        await book.save();
        res.send(book);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// PATCH /:id/updateCopies - Update book copies
router.patch('/:id/updateCopies', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { copies } = req.body;

        if (copies < 1) {
            return res.status(400).send({ error: 'Copies must be 1 or more.' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).send('Book not found');
        }

        const currentCopiesCount = book.copies;
        const newCopiesCount = copies;

        for (let i = currentCopiesCount + 1; i <= newCopiesCount; i++) {
            const newCopy = new BookCopy({
                book: book._id,
                copyNumber: i,
            });
            await newCopy.save();
        }

        book.copies = newCopiesCount;
        book.availableCopies = newCopiesCount - book.checkedOutCopies;

        await book.save();
        res.send(book);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete a book by id
router.delete('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Book not found');
        }
        console.log('Book found:', book);

        // Find all BookCopy documents for this book
        const bookCopies = await BookCopy.find({ book: book._id });

        // Update all associated CheckoutRecords
        await CheckoutRecord.updateMany(
            { bookCopy: { $in: bookCopies.map(copy => copy._id) } },
            { $set: { bookCopy: null } }
        );

        // Delete BookCopy documents
        await BookCopy.deleteMany({ book: book._id });

        // Delete the book
        await Book.deleteOne({ _id: book._id });

        console.log('Book removed successfully');

        res.status(200).send({ message: 'Book and associated records deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).send(error.message);
    }
});

// Get book history
router.get('/:id/history', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const bookCopies = await BookCopy.find({ book: req.params.id });
        const checkoutRecords = await CheckoutRecord.find({
            bookCopy: { $in: bookCopies.map(copy => copy._id) }
        }).populate('student', 'firstName lastName');

        res.json(checkoutRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//get checkout status
router.get('/:id/copies', async (req, res) => {
    try {
        const bookCopies = await BookCopy.find({ book: req.params.id });
        res.json(bookCopies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current status of all copies of a book
router.get('/:id/status', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const bookCopies = await BookCopy.find({ book: req.params.id });
        res.json(bookCopies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const reconcileBookAvailability = async (bookId) => {
    const book = await Book.findById(bookId);
    const activeCheckouts = await CheckoutRecord.countDocuments({
        'bookCopy.book': bookId,
        status: 'checked out'
    });

    book.availableCopies = book.copies - activeCheckouts;
    await book.save();

    console.log(`Reconciled book ${book.title}: Total copies: ${book.copies}, Available: ${book.availableCopies}`);
    return book;
};

// Add a new route to reconcile a specific book
router.post('/reconcile/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const book = await reconcileBookAvailability(req.params.id);
        res.json({ message: 'Book availability reconciled', book });
    } catch (error) {
        console.error('Error reconciling book availability:', error);
        res.status(500).json({ message: 'Error reconciling book availability', error: error.message });
    }
});

router.post('/reconcile', async (req, res) => {
    try {
        // Log current state
        console.log('Before reconciliation:');
        console.log('Total books:', await Book.countDocuments());
        console.log('Total book copies:', await BookCopy.countDocuments());
        console.log('Total checkout records:', await CheckoutRecord.countDocuments());

        // Find all BookCopy documents that reference non-existent books
        const books = await Book.find().select('_id');
        const orphanedCopies = await BookCopy.find({ book: { $nin: books.map(b => b._id) } });
        console.log('Orphaned book copies:', orphanedCopies.length);

        // Delete these orphaned BookCopy documents
        const deletedCopiesResult = await BookCopy.deleteMany({ _id: { $in: orphanedCopies.map(copy => copy._id) } });

        // Find and delete all CheckoutRecord documents that reference non-existent BookCopy documents
        const bookCopies = await BookCopy.find().select('_id');
        const orphanedCheckouts = await CheckoutRecord.find({ bookCopy: { $nin: bookCopies.map(bc => bc._id) } });
        console.log('Orphaned checkouts:', orphanedCheckouts.length);

        const deletedCheckoutsResult = await CheckoutRecord.deleteMany({ _id: { $in: orphanedCheckouts.map(checkout => checkout._id) } });

        // Update the checked out count
        const checkedOutCount = await CheckoutRecord.countDocuments({ status: 'checked out' });

        // Log final state
        console.log('After reconciliation:');
        console.log('Total books:', await Book.countDocuments());
        console.log('Total book copies:', await BookCopy.countDocuments());
        console.log('Total checkout records:', await CheckoutRecord.countDocuments());
        console.log('Checked out books:', checkedOutCount);

        res.json({
            message: 'Reconciliation complete',
            deletedCopies: deletedCopiesResult.deletedCount,
            deletedCheckouts: deletedCheckoutsResult.deletedCount,
            currentCheckedOutCount: checkedOutCount,
            totalBooks: await Book.countDocuments(),
            totalBookCopies: await BookCopy.countDocuments(),
            totalCheckoutRecords: await CheckoutRecord.countDocuments()
        });
    } catch (error) {
        console.error('Reconciliation error:', error);
        res.status(500).json({ message: 'An error occurred during reconciliation', error: error.message });
    }
});

module.exports = router;
