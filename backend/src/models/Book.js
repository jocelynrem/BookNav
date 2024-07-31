// backend/src/models/Book.js
const mongoose = require('mongoose');
const CheckoutRecord = require('./CheckoutRecord');

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
    subject: {
        type: String,
    },
    coverImage: {
        type: String,
    },
    isbn: {
        type: String,
        index: true
    },
    readingLevel: {
        type: String,
        trim: true
    },
    lexileScore: {
        type: Number
    },
    arPoints: {
        type: Number
    },
    copies: {
        type: Number,
        default: 1,
        validate: {
            validator: function (v) {
                return v >= 1;
            },
            message: props => `${props.value} is not a valid number of copies! Must be 1 or more.`
        }
    },
    copiesAvailable: {
        type: Number,
        default: 1,
        validate: {
            validator: function (v) {
                return v >= 0;
            },
            message: props => `${props.value} is not a valid number of available copies! Must be 0 or more.`
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the `updatedAt` field before saving
bookSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Pre-hook to delete related checkout records when a book is deleted
bookSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        await CheckoutRecord.deleteMany({ book: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
