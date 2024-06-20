const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Create a new book
router.post('/', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the request body for debugging

        const { title, authorFirstName, authorLastName, publishedDate, pages, genre, coverImage, isbn } = req.body;

        if (!title || !authorFirstName || !authorLastName) {
            return res.status(400).send('Title, Author First Name, and Author Last Name are required');
        }

        let book = await Book.findOne({ isbn });

        if (book) {
            // If book already exists, update the copies
            book.copies.push({ status: 'in library' });
        } else {
            book = new Book({
                title,
                authorFirstName,
                authorLastName,
                publishedDate,
                pages,
                genre,
                coverImage,
                isbn
            });
        }

        await book.save();
        console.log('Saved book:', book); // Log the saved book for debugging
        res.status(201).send(book);
    } catch (error) {
        console.error('Error creating book:', error); // Log detailed error
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

// Update a book by id
router.patch('/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).send();
        }
        res.status(200).send(book);
    } catch (error) {
        res.status(400).send(error);
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
