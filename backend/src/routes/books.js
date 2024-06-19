// backend/src/routes/books.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Create a new book or add copies if the book already exists
router.post('/', async (req, res) => {
    try {
        const { title, author, publishedDate, pages, genre } = req.body;
        let book = await Book.findOne({ title, author });

        if (book) {
            // If the book exists, add a new copy
            book.copies.push({ status: 'in library' });
            await book.save();
            res.status(200).send({
                message: 'Book already exists. Added another copy.',
                book
            });
        } else {
            // If the book doesn't exist, create a new book
            book = new Book({
                title,
                author,
                publishedDate,
                pages,
                genre,
                copies: [{ status: 'in library' }],
            });
            await book.save();
            res.status(201).send(book);
        }
    } catch (error) {
        res.status(400).send(error);
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
