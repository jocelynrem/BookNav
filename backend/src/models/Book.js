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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

bookSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;