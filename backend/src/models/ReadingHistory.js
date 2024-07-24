// backend/src/models/ReadingHistory.js
const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    entry: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const ReadingHistory = mongoose.model('ReadingHistory', readingHistorySchema);

module.exports = ReadingHistory;
