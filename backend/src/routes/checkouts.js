const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const CheckoutRecord = require('../models/CheckoutRecord');
const BookCopy = require('../models/BookCopy');

// Checkout a book
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { bookCopyId, studentId, dueDate } = req.body;

        // Check if the book copy is available
        const bookCopy = await BookCopy.findById(bookCopyId);
        if (!bookCopy || bookCopy.status !== 'available') {
            return res.status(400).json({ message: 'Book copy not available' });
        }

        // Create checkout record
        const checkoutRecord = new CheckoutRecord({
            bookCopy: bookCopyId,
            student: studentId,
            checkoutDate: new Date(),
            dueDate: new Date(dueDate)
        });

        await checkoutRecord.save();

        // Update book copy status
        bookCopy.status = 'checked out';
        await bookCopy.save();

        res.status(201).json(checkoutRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Return a book
router.put('/return/:id', authenticateToken, async (req, res) => {
    try {
        const checkoutRecord = await CheckoutRecord.findById(req.params.id);
        if (!checkoutRecord) {
            return res.status(404).json({ message: 'Checkout record not found' });
        }

        checkoutRecord.returnDate = new Date();
        checkoutRecord.status = 'returned';
        await checkoutRecord.save();

        // Update book copy status
        const bookCopy = await BookCopy.findById(checkoutRecord.bookCopy);
        bookCopy.status = 'available';
        await bookCopy.save();

        res.json(checkoutRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all checkouts (teachers only)
router.get('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const checkouts = await CheckoutRecord.find()
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title author' }
            });
        res.json(checkouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;