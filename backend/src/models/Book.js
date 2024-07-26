const mongoose = require('mongoose');
const BookCopy = require('./BookCopy');
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

bookSchema.virtual('availableCopies', {
    ref: 'BookCopy',
    localField: '_id',
    foreignField: 'book',
    count: true,
    match: { status: 'available' }
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

bookSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to reconcile copies
bookSchema.methods.reconcileCopies = async function () {
    const BookCopy = mongoose.model('BookCopy');
    const totalCopies = await BookCopy.countDocuments({ book: this._id });
    const availableCopies = await BookCopy.countDocuments({ book: this._id, status: 'available' });

    if (this.copies !== totalCopies) {
        console.log(`Reconciling total copies for book ${this._id}`);
        console.log(`Current copies: ${this.copies}, Actual total copies: ${totalCopies}`);
        this.copies = totalCopies;
        await this.save();
    }

    console.log(`Available copies: ${availableCopies}`);
    return { totalCopies, availableCopies };
};

bookSchema.pre('deleteOne', { document: false, query: true }, async function () {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
        // Delete all associated BookCopy documents
        await BookCopy.deleteMany({ book: doc._id });

        // Find all CheckoutRecords associated with this book's copies and delete them
        const bookCopies = await BookCopy.find({ book: doc._id });
        await CheckoutRecord.deleteMany({ bookCopy: { $in: bookCopies.map(copy => copy._id) } });
    }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;