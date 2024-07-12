// backend/src/routes/books.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

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

// Create a new book
router.post('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        console.log('Received request to create book:', req.body);
        const { title, author, publishedDate, pages, genre, subject, coverImage, isbn, copies } = req.body;

        if (!title || !author) {
            return res.status(400).send('Title and Author are required');
        }

        const book = new Book({
            title,
            author,
            publishedDate,
            pages,
            genre,
            subject,
            coverImage,
            isbn,
            copies: copies || 1,
            availableCopies: copies || 1,
            checkedOutCopies: 0
        });

        await book.save();
        console.log('Book saved:', book);

        // Add the book to the user's library
        const user = await User.findById(req.user.id);
        user.books.push(book._id);
        await user.save();
        console.log('Book added to user library');

        res.status(201).send(book);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(400).send(error.message);
    }
});

// Get all books for a user
router.get('/user-books', authenticateToken, roleAuth('teacher'), async (req, res) => {
    console.log('Accessing /user-books route');
    console.log('User:', req.user);
    try {
        const userId = req.user.id;
        console.log('Fetching books for user ID:', userId);
        const user = await User.findById(userId).populate('books');
        console.log('User books:', user.books);
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
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).send();
        }
        res.status(200).send(book);
    } catch (error) {
        res.status(500).send(error);
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

// Get current status of all copies of a book
router.get('/:id/status', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const bookCopies = await BookCopy.find({ book: req.params.id });
        res.json(bookCopies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
