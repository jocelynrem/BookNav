const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Create a new book
router.post('/', async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const { title, authorFirstName, authorLastName, publishedDate, pages, genre, coverImage, isbn, copies } = req.body;

        if (!title || !authorFirstName || !authorLastName) {
            return res.status(400).send('Title, Author First Name, and Author Last Name are required');
        }

        // Create a new book instance
        const book = new Book({
            title,
            authorFirstName,
            authorLastName,
            publishedDate,
            pages,
            genre,
            coverImage,
            isbn,
            copies: copies || 1,
            availableCopies: copies || 1,
            checkedOutCopies: 0
        });

        // Save the new book
        await book.save();
        console.log('Saved book:', book);
        res.status(201).send(book);
    } catch (error) {
        console.error('Error creating book:', error);
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

        console.log('Updates:', updates); // Log updates for debugging

        // Validate that copies is not negative
        if (updates.copies !== undefined && updates.copies < 1) {
            return res.status(400).send({ error: 'Copies must be 1 or more.' });
        }

        // Find the book to update
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).send({ error: 'Book not found.' });
        }

        // Update book properties
        Object.keys(updates).forEach(update => book[update] = updates[update]);

        // Adjust availableCopies and checkedOutCopies based on the new copies count
        if (updates.copies !== undefined) {
            book.availableCopies = updates.copies - book.checkedOutCopies;
        }

        await book.save();
        res.send(book);
    } catch (error) {
        console.error('Error updating book:', error); // Log detailed error
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
        book.availableCopies = copies - book.checkedOutCopies; // Adjust availableCopies accordingly

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
