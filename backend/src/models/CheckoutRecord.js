// backend/src/models/CheckoutRecord.js
const mongoose = require('mongoose');

const checkoutRecordSchema = new mongoose.Schema({
    bookCopy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookCopy',
        required: true,
        validate: {
            validator: async function (bookCopyId) {
                const bookCopy = await mongoose.model('BookCopy').findById(bookCopyId);
                return bookCopy != null;
            },
            message: 'Referenced book copy does not exist'
        }
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    checkoutDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['checked out', 'returned', 'overdue'],
        default: 'checked out'
    }
});

checkoutRecordSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const CheckoutRecord = mongoose.model('CheckoutRecord', checkoutRecordSchema);

module.exports = CheckoutRecord;
