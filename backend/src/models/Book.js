const mongoose = require('mongoose');

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
    subject: {
        type: String,
    },
    coverImage: {
        type: String,
    },
    isbn: {
        type: String,
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
    availableCopies: {
        type: Number,
        default: 1,
    },
    checkedOutCopies: {
        type: Number,
        default: 0,
    }
});

// Pre-save hook to ensure copies are not negative and at least 1 and that the sum of available and checked out copies equals the total number of copies
bookSchema.pre('save', function (next) {
    if (this.copies < 1) {
        const err = new Error('A book must have at least 1 copy.');
        next(err);
    } else if (this.checkedOutCopies > this.copies) {
        const err = new Error('Checked out copies cannot exceed total copies.');
        next(err);
    } else {
        this.availableCopies = this.copies - this.checkedOutCopies;
        next();
    }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
