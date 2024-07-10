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
    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    grade: {
        type: Number,
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    readingLevel: {
        type: String,
        trim: true
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

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;