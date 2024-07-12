//backend/src/models/BookCopy.js
const mongoose = require('mongoose');

const bookCopySchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    copyNumber: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        enum: ['available', 'checked out', 'in repair', 'lost'],
        default: 'available'
    },
    condition: {
        type: String,
        enum: ['new', 'good', 'fair', 'poor'],
        default: 'good'
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

bookCopySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const BookCopy = mongoose.model('BookCopy', bookCopySchema);

module.exports = BookCopy;