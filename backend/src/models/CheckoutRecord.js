const mongoose = require('mongoose');

const checkoutRecordSchema = new mongoose.Schema({
    bookCopy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookCopy',
        required: true
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

checkoutRecordSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const CheckoutRecord = mongoose.model('CheckoutRecord', checkoutRecordSchema);

module.exports = CheckoutRecord;