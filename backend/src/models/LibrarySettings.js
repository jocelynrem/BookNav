const mongoose = require('mongoose');

const librarySettingsSchema = new mongoose.Schema({
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