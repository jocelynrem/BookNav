// backend/src/routes/checkouts.js
const express = require('express');
const router = express.Router();
const CheckoutRecord = require('../models/CheckoutRecord');
const BookCopy = require('../models/BookCopy');
const Student = require('../models/Student');
const LibrarySettings = require('../models/LibrarySettings');
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

        // Check if the student has reached the maximum number of checkouts
        const studentCheckouts = await CheckoutRecord.countDocuments({ student: studentId, status: 'checked out' });
        const settings = await LibrarySettings.findOne().exec();

        // If no settings found, use default values
        const maxCheckoutBooks = settings ? settings.maxCheckoutBooks : 5;
        const defaultDueDays = settings ? settings.defaultDueDays : 14;

        if (studentCheckouts >= maxCheckoutBooks) {
            return res.status(400).json({ message: 'Maximum number of checkouts reached for this student' });
        }

        // Find an available book copy
        const bookCopy = await BookCopy.findOneAndUpdate(
            { book: bookId, status: 'available' },
            { status: 'checked out' },
            { new: true }
        );

        if (!bookCopy) {
            return res.status(400).json({ message: 'No available copies of this book' });
        }

        // Create checkout record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + defaultDueDays);

        const checkoutRecord = new CheckoutRecord({
            bookCopy: bookCopy._id,
            student: studentId,
            checkoutDate: new Date(),
            dueDate: dueDate
        });

        await checkoutRecord.save();

        res.status(201).json(checkoutRecord);
    } catch (error) {
        console.error('Error in checkout route:', error);
        res.status(500).json({ message: 'Error processing checkout', error: error.message });
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

// Return a book by ISBN
router.put('/return-by-isbn', authenticateToken, roleAuth(['teacher', 'student']), async (req, res) => {
    try {
        const { isbn } = req.body;

        const book = await Book.findOne({ isbn });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const bookCopy = await BookCopy.findOne({ book: book._id, status: 'checked out' });
        if (!bookCopy) {
            return res.status(400).json({ message: 'No active checkout found for this book' });
        }

        const checkoutRecord = await CheckoutRecord.findOne({
            bookCopy: bookCopy._id,
            status: 'checked out'
        });

        if (!checkoutRecord) {
            return res.status(400).json({ message: 'No active checkout found for this book' });
        }

        // Update the checkout record
        checkoutRecord.returnDate = new Date();
        checkoutRecord.status = 'returned';
        await checkoutRecord.save();

        // Update the book copy status
        bookCopy.status = 'available';
        await bookCopy.save();

        // Update the book's available copies count
        book.availableCopies = await BookCopy.countDocuments({ book: book._id, status: 'available' });
        await book.save();

        res.json({ message: 'Book returned successfully', checkoutRecord });
    } catch (error) {
        console.error('Error returning book by ISBN:', error);
        res.status(500).json({ message: 'Error returning book', error: error.message });
    }
});

router.get('/book/:bookId', async (req, res) => {
    try {
        const bookCopies = await BookCopy.find({ book: req.params.bookId });
        const checkouts = await CheckoutRecord.find({
            bookCopy: { $in: bookCopies.map(copy => copy._id) },
            status: 'checked out'
        }).populate('student').populate('bookCopy');
        res.json(checkouts);
    } catch (error) {
        console.error('Error fetching checkouts for book:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/book/:bookId/all', async (req, res) => {
    try {
        const bookId = req.params.bookId;

        const bookCopies = await BookCopy.find({ book: bookId });

        const checkouts = await CheckoutRecord.find({
            bookCopy: { $in: bookCopies.map(copy => copy._id) }
        }).populate('student').populate({
            path: 'bookCopy',
            populate: { path: 'book' }
        });

        res.json(checkouts);
    } catch (error) {
        console.error('Error fetching all checkouts for book:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/current', async (req, res) => {
    try {
        const checkouts = await CheckoutRecord.find({
            bookCopy: req.query.bookCopyId,
            status: 'checked out'
        }).populate('student');
        res.json(checkouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get detailed reading history for a student
router.get('/student/:studentId/detailed-history', authenticateToken, roleAuth(['teacher', 'student']), async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const checkouts = await CheckoutRecord.find({
            student: studentId,
            status: 'returned'  // Only include returned books
        })
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title' }
            })
            .sort({ returnDate: -1 });  // Sort by return date, most recent first

        const detailedHistory = checkouts.map(checkout => ({
            bookTitle: checkout.bookCopy.book.title,
            checkoutDate: checkout.checkoutDate,
            returnDate: checkout.returnDate,
            daysKept: Math.ceil((checkout.returnDate - checkout.checkoutDate) / (1000 * 60 * 60 * 24))
        }));

        res.status(200).json(detailedHistory);
    } catch (error) {
        console.error('Error in /student/:studentId/detailed-history route:', error);
        res.status(500).json({ message: 'Error fetching detailed reading history', error: error.message });
    }
});

router.get('/current/:bookId', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const checkouts = await CheckoutRecord.find({
            'bookCopy.book': bookId,
            status: 'checked out'
        }).populate('student').populate({
            path: 'bookCopy',
            populate: { path: 'book' }
        });
        res.json(checkouts);
    } catch (error) {
        console.error('Error fetching current checkouts:', error);
        res.status(500).json({ message: 'Error fetching current checkouts', error: error.message });
    }
});

module.exports = router;