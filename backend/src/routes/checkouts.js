// backend/src/routes/checkouts.js
const express = require('express');
const router = express.Router();
const CheckoutRecord = require('../models/CheckoutRecord');
const BookCopy = require('../models/BookCopy');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

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

// Checkout a book
router.post('/', authenticateToken, roleAuth(['teacher', 'student']), async (req, res) => {
    try {
        const { bookCopyId, studentId, dueDate } = req.body;
        console.log('Checkout request received:', { bookCopyId, studentId, dueDate });

        // Check if the book copy is available
        const bookCopy = await BookCopy.findById(bookCopyId);
        if (!bookCopy || bookCopy.status !== 'available') {
            console.log('Book copy not available:', bookCopy);
            return res.status(400).json({ message: 'Book copy not available' });
        }

        // Check if the student exists
        const student = await Student.findById(studentId);
        if (!student) {
            console.log('Student not found:', studentId);
            return res.status(400).json({ message: 'Student not found' });
        }

        // If the user is a student, ensure they're checking out for themselves
        if (req.user.role === 'student' && req.user.id !== studentId) {
            return res.status(403).json({ message: 'Students can only check out books for themselves' });
        }

        // Create checkout record
        const checkoutRecord = new CheckoutRecord({
            bookCopy: bookCopyId,
            student: studentId,
            checkoutDate: new Date(),
            dueDate: new Date(dueDate)
        });

        await checkoutRecord.save();
        console.log('Checkout record created:', checkoutRecord);

        // Update book copy status
        bookCopy.status = 'checked out';
        await bookCopy.save();

        res.status(201).json(checkoutRecord);
    } catch (error) {
        console.error('Error in checkout route:', error);
        res.status(400).json({ message: error.message });
    }
});

// Return a book
router.put('/:id/return', authenticateToken, roleAuth(['teacher', 'student']), async (req, res) => {
    try {
        console.log('Return request received for ID:', req.params.id);
        console.log('Request body:', req.body);

        const checkoutRecord = await CheckoutRecord.findById(req.params.id);
        console.log('Checkout record found:', checkoutRecord);

        if (!checkoutRecord) {
            console.log('Checkout record not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Checkout record not found' });
        }

        // If the user is a student, ensure they're returning their own book
        if (req.user.role === 'student' && req.user.id !== checkoutRecord.student.toString()) {
            return res.status(403).json({ message: 'Students can only return their own books' });
        }

        checkoutRecord.returnDate = new Date(req.body.returnedOn);
        checkoutRecord.status = 'returned';
        await checkoutRecord.save();
        console.log('Updated checkout record:', checkoutRecord);

        const bookCopy = await BookCopy.findById(checkoutRecord.bookCopy);
        bookCopy.status = 'available';
        await bookCopy.save();
        console.log('Updated book copy:', bookCopy);

        res.json(checkoutRecord);
    } catch (error) {
        console.error('Error in return route:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;