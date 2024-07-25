// backend/src/routes/checkouts.js
const express = require('express');
const router = express.Router();
const CheckoutRecord = require('../models/CheckoutRecord');
const BookCopy = require('../models/BookCopy');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Book = require('../models/Book');

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
        const { bookId, studentId } = req.body;

        // Find an available book copy
        const bookCopy = await BookCopy.findOneAndUpdate(
            { book: bookId, status: 'available' },
            { status: 'checked out' },
            { new: true }
        );

        if (!bookCopy) {
            return res.status(400).json({ message: 'No available copies of this book' });
        }

        // Check if the student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(400).json({ message: 'Student not found' });
        }

        // Ensure students can only check out for themselves
        if (req.user.role === 'student' && req.user.id !== studentId) {
            return res.status(403).json({ message: 'Students can only check out books for themselves' });
        }

        // Create checkout record
        const checkoutRecord = new CheckoutRecord({
            bookCopy: bookCopy._id,
            student: studentId,
            checkoutDate: new Date(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        });

        await checkoutRecord.save();

        res.status(201).json(checkoutRecord);
    } catch (error) {
        console.error('Error in checkout route:', error);
        res.status(400).json({ message: error.message });
    }
});


// Return a book
router.put('/:id/return', authenticateToken, roleAuth(['teacher', 'student']), async (req, res) => {
    try {
        const checkoutRecord = await CheckoutRecord.findById(req.params.id);
        if (!checkoutRecord) {
            return res.status(404).json({ message: 'Checkout record not found' });
        }

        if (req.user.role === 'student' && req.user.id !== checkoutRecord.student.toString()) {
            return res.status(403).json({ message: 'Students can only return their own books' });
        }

        checkoutRecord.returnDate = new Date(req.body.returnedOn);
        checkoutRecord.status = 'returned';
        await checkoutRecord.save();

        const bookCopy = await BookCopy.findById(checkoutRecord.bookCopy);
        bookCopy.status = 'available';
        await bookCopy.save();

        const book = await Book.findById(bookCopy.book);
        book.availableCopies += 1;
        book.checkedOutCopies -= 1;
        await book.save();

        res.json({ message: 'Book returned successfully', checkoutRecord, bookCopy, book });
    } catch (error) {
        console.error('Error in return route:', error);
        res.status(400).json({ message: error.message });
    }
});


router.get('/status', async (req, res) => {
    try {
        const { isbn, studentId } = req.query;

        const normalizedISBN = isbn.replace(/[-\s]/g, '').trim();
        const book = await Book.findOne({ isbn: { $regex: new RegExp('^' + normalizedISBN + '$', 'i') } });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const checkout = await CheckoutRecord.findOne({
            book: book._id,
            student: studentId,
            status: 'checked out'
        });

        if (checkout) {
            res.json({ action: 'return', title: book.title, bookId: book._id });
        } else {
            res.json({ action: 'checkout', title: book.title, bookId: book._id });
        }
    } catch (error) {
        console.error('Error checking book status:', error);
        res.status(500).json({ message: 'Error checking book status', error: error.message });
    }
});

// Get entire checkout history for a student
router.get('/student/:studentId/history', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const checkouts = await CheckoutRecord.find({ student: studentId })
            .populate('bookCopy')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book' }
            });

        res.status(200).json(checkouts);
    } catch (error) {
        console.error('Error in /student/:studentId/history route:', error);
        res.status(500).json({ message: 'Error fetching checkout history', error: error.message });
    }
});

// Get all current checkouts for a student
router.get('/student/:studentId/current', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const checkouts = await CheckoutRecord.find({ student: studentId, status: 'checked out' })
            .populate('bookCopy')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book' }
            });

        res.status(200).json(checkouts);
    } catch (error) {
        console.error('Error in /student/:studentId/current route:', error);
        res.status(500).json({ message: 'Error fetching current checkouts', error: error.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const books = await Book.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } },
                { isbn: { $regex: q, $options: 'i' } }
            ]
        }).limit(20);

        res.json(books);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Error searching books', error: error.message });
    }
});

router.get('/bookcopy/:bookCopyId', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { bookCopyId } = req.params;
        const checkoutRecords = await CheckoutRecord.find({ bookCopy: bookCopyId })
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title author' }
            });
        res.json(checkoutRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;