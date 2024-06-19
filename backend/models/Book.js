// backend/models/Book.js

const mongoose = require('mongoose');

const copySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['in library', 'checked out'],
        default: 'in library',
    }
});

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    publishedDate: {
        type: Date,
    },
    pages: {
        type: Number,
    },
    genre: {
        type: String,
    },
    copies: {
        type: [copySchema],
        default: [{ status: 'in library' }],
    },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
