// backend/src/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    readingLevel: {
        type: String,
        trim: true
    },
    pin: {
        type: String,
        required: true,
        match: /^\d{4}$/
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

studentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Unique combination of firstName, lastName, and class
studentSchema.index({ firstName: 1, lastName: 1, class: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;