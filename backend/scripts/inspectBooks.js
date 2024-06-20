// scripts/inspectBooks.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Define the book schema (ensure this matches your actual schema)
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
    authorFirstName: {
        type: String,
        required: true,
    },
    authorLastName: {
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
    coverImage: {
        type: String,
    },
    isbn: {
        type: String,
    },
    copies: {
        type: [copySchema],
        default: [{ status: 'in library' }],
    },
});

const Book = mongoose.model('Book', bookSchema);

// Connect to MongoDB using the connection string from the environment variable
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');

        // Query the books collection
        return Book.find();
    })
    .then(books => {
        console.log('Books:', books);
    })
    .catch(err => {
        console.error('Error:', err);
    })
    .finally(() => {
        mongoose.disconnect();
    });
