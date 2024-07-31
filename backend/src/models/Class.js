// backend/src/models/Class.js
const mongoose = require('mongoose');
const Student = require('./Student');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    grade: {
        type: String,
        required: true
    },
    schoolYear: {
        type: String,
        required: false
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

// Update the updatedAt field before saving
classSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Pre-hook for deleting students when a class is deleted
classSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        await Student.deleteMany({ class: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

// Update students' grades when class grade changes
classSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.grade !== undefined) {
        const Class = this.model;
        const doc = await Class.findOne(this.getQuery());
        if (doc) {
            await mongoose.model('Student').updateMany(
                { class: doc._id },
                { $set: { grade: update.grade } }
            );
        }
    }
    next();
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
