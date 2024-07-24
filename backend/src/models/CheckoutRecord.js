// backend/src/models/CheckoutRecord.js
const mongoose = require('mongoose');
const ReadingHistory = require('./ReadingHistory'); // Import the ReadingHistory model

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
    }
});

// Post-save hook to create a reading history entry for the student
checkoutRecordSchema.post('save', async function (record, next) {
    try {
        const entry = `Book checked out on ${record.checkoutDate.toISOString()}${record.returnDate ? ` and returned on ${record.returnDate.toISOString()}` : ''}`;
        await ReadingHistory.create({
            student: record.student,
            entry: entry,
            date: record.checkoutDate
        });
        next();
    } catch (error) {
        next(error);
    }
});

const CheckoutRecord = mongoose.model('CheckoutRecord', checkoutRecordSchema);

module.exports = CheckoutRecord;
