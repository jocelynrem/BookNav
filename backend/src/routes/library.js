const express = require('express');
const router = express.Router();
const LibrarySettings = require('../models/LibrarySettings');  // You'll need to create this model
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.get('/settings', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        let settings = await LibrarySettings.findOne();
        if (!settings) {
            settings = new LibrarySettings({
                defaultDueDays: 14,
                maxCheckoutBooks: 5
            });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching library settings:', error);
        res.status(500).json({ message: 'Error fetching library settings', error: error.message });
    }
});

router.put('/settings', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { defaultDueDays, maxCheckoutBooks } = req.body;
        let settings = await LibrarySettings.findOne();
        if (!settings) {
            settings = new LibrarySettings();
        }
        settings.defaultDueDays = defaultDueDays;
        settings.maxCheckoutBooks = maxCheckoutBooks;
        await settings.save();
        res.json(settings);
    } catch (error) {
        console.error('Error updating library settings:', error);
        res.status(500).json({ message: 'Error updating library settings', error: error.message });
    }
});

module.exports = router;