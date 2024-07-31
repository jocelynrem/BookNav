// backend/src/routes/books.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Book = require('../models/Book');
const CheckoutRecord = require('../models/CheckoutRecord');

router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.user.id;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const books = await Book.find({
            user: userId,
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } },
                { isbn: { $regex: q, $options: 'i' } }
            ]
        })
            .select('title author isbn copiesAvailable') // Select necessary fields
            .limit(20);

        res.json(books);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Error searching books', error: error.message });
    }
});

// Create a new book
router.post('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { title, author, isbn, copies = 1, ...otherFields } = req.body;
        const userId = req.user.id;

        if (copies < 1) {
            return res.status(400).json({ message: 'Copies must be at least 1.' });
        }

        let book = await Book.findOne({ isbn, user: userId });
        if (!book) {
            book = new Book({
                title,
                author,
                isbn,
                copies,
                copiesAvailable: copies,
                user: userId,
                ...otherFields
            });
            await book.save();

            // Associate the new book with the user
            await User.findByIdAndUpdate(userId, { $push: { books: book._id } });
        }

        res.status(201).json(book);
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(400).json({ message: error.message, stack: error.stack });
    }
});

// Add more copies of a book owned by the user
router.post('/add-copies', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { bookId, numberOfCopies } = req.body;
        const userId = req.user.id;

        const book = await Book.findOne({ _id: bookId, user: userId });
        if (!book) {
            return res.status(403).json({ message: 'You can only add copies to books in your library' });
        }

        book.copies += numberOfCopies;
        book.copiesAvailable += numberOfCopies;
        await book.save();

        res.status(200).json(book);
    } catch (error) {
        console.error('Error adding book copies:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get all books for the authenticated user
router.get('/user-books', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const books = await Book.find({ user: userId });

        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching user books:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get a book by id
router.get('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;
        const book = await Book.findOne({ _id: req.params.id, user: userId });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /:id - Update a book by ID
router.patch('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { copies } = req.body;
        const userId = req.user.id;

        if (copies < 1) {
            return res.status(400).send({ error: 'Copies must be 1 or more.' });
        }

        const book = await Book.findOne({ _id: id, user: userId });
        if (!book) {
            return res.status(404).send('Book not found');
        }

        book.copies = copies;
        book.copiesAvailable = Math.min(book.copiesAvailable, copies);
        await book.save();

        res.status(200).json(book);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(400).send({ error: error.message });
    }
});

// Delete a book by id
router.delete('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;
        const book = await Book.findOne({ _id: req.params.id, user: userId });

        if (!book) {
            return res.status(404).send('Book not found in your library');
        }

        await book.deleteOne();

        res.status(200).send({ message: 'Book and associated checkouts removed successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).send({ message: error.message });
    }
});

// Get book history
router.get('/:id/history', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || book.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const checkoutRecords = await CheckoutRecord.find({
            book: book._id
        }).populate('student', 'firstName lastName');

        res.json(checkoutRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
