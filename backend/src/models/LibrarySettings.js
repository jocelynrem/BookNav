const mongoose = require('mongoose');

const librarySettingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    defaultDueDays: {
        type: Number,
        default: 14
    },
    maxCheckoutBooks: {
        type: Number,
        default: 5
    }
});

const LibrarySettings = mongoose.model('LibrarySettings', librarySettingsSchema);

module.exports = LibrarySettings;