const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const { authenticateToken } = require('../middleware/auth');

// Add a book to user's collection
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { title, authorFirstName, authorLastName, publishedDate, pages, genre, subject, coverImage, isbn, copies } = req.body;
        const userId = req.user.id;

        const book = new Book({
            title,
            authorFirstName,
            authorLastName,
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

        const user = await User.findById(userId);
        user.books.push(book);
        await user.save();

        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all books for a user
router.get('/user-books', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('books');
        res.status(200).json(user.books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new book
router.post('/', async (req, res) => {
    try {
        const { title, authorFirstName, authorLastName, publishedDate, pages, genre, subject, coverImage, isbn, copies } = req.body;

        if (!title || !authorFirstName || !authorLastName) {
            return res.status(400).send('Title, Author First Name, and Author Last Name are required');
        }

        const book = new Book({
            title,
            authorFirstName,
            authorLastName,
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
        res.status(201).send(book);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get all books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).send(books);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a book by id
router.get('/:id', async (req, res) => {
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
router.patch('/:id', async (req, res) => {
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
router.patch('/:id/updateCopies', async (req, res) => {
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

        book.copies = copies;
        book.availableCopies = copies - book.checkedOutCopies;

        await book.save();
        res.send(book);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete a book by id
router.delete('/:id', async (req, res) => {
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

module.exports = router;
