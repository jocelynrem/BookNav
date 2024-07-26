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
        console.log(`Checkout request received for book: ${bookId}, student: ${studentId}`);

        // Find the book and reconcile copies
        const book = await Book.findById(bookId);
        if (!book) {
            console.log(`Book not found: ${bookId}`);
            return res.status(404).json({ message: 'Book not found' });
        }
        const { availableCopies } = await book.reconcileCopies();
        console.log(`Book found and reconciled:`, book);

        if (availableCopies <= 0) {
            console.log(`No available copies for book: ${bookId}`);
            return res.status(400).json({ message: 'No available copies of this book' });
        }

        // Find an available book copy
        const bookCopy = await BookCopy.findOneAndUpdate(
            { book: bookId, status: 'available' },
            { status: 'checked out' },
            { new: true }
        );

        if (!bookCopy) {
            console.log(`No available book copy found for book: ${bookId}`);
            return res.status(400).json({ message: 'No available copies of this book' });
        }
        console.log(`Book copy found and updated:`, bookCopy);

        // Check if the student exists
        const student = await Student.findById(studentId);
        if (!student) {
            console.log(`Student not found: ${studentId}`);
            return res.status(400).json({ message: 'Student not found' });
        }
        console.log(`Student found:`, student);

        // Create checkout record
        const checkoutRecord = new CheckoutRecord({
            bookCopy: bookCopy._id,
            student: studentId,
            checkoutDate: new Date(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        });

        await checkoutRecord.save();
        console.log(`Checkout record created:`, checkoutRecord);

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
        console.log(`Attempting to return book with ISBN: ${isbn}`);

        const book = await Book.findOne({ isbn });
        if (!book) {
            console.log(`Book not found for ISBN: ${isbn}`);
            return res.status(404).json({ message: 'Book not found' });
        }
        console.log(`Found book:`, book);

        const bookCopy = await BookCopy.findOne({ book: book._id, status: 'checked out' });
        if (!bookCopy) {
            console.log(`No checked out copy found for book: ${book.title} (ISBN: ${isbn})`);
            return res.status(400).json({ message: 'No active checkout found for this book' });
        }

        const checkoutRecord = await CheckoutRecord.findOne({
            bookCopy: bookCopy._id,
            status: 'checked out'
        });

        if (!checkoutRecord) {
            console.log(`No active checkout record found for book copy: ${bookCopy._id}`);
            return res.status(400).json({ message: 'No active checkout found for this book' });
        }
        console.log(`Found checkout record:`, checkoutRecord);

        // Update the checkout record
        checkoutRecord.returnDate = new Date();
        checkoutRecord.status = 'returned';
        await checkoutRecord.save();
        console.log(`Updated checkout record:`, checkoutRecord);

        // Update the book copy status
        bookCopy.status = 'available';
        await bookCopy.save();
        console.log(`Updated book copy:`, bookCopy);

        // Update the book's available copies count
        book.availableCopies = await BookCopy.countDocuments({ book: book._id, status: 'available' });
        await book.save();
        console.log(`Updated book available copies:`, book.availableCopies);

        res.json({ message: 'Book returned successfully', checkoutRecord });
    } catch (error) {
        console.error('Error returning book by ISBN:', error);
        res.status(500).json({ message: 'Error returning book', error: error.message });
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
        console.log(`Checkouts found for book ${bookId}:`, checkouts);
        res.json(checkouts);
    } catch (error) {
        console.error('Error fetching current checkouts:', error);
        res.status(500).json({ message: 'Error fetching current checkouts', error: error.message });
    }
});

module.exports = router;