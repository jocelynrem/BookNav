const express = require('express');
const router = express.Router();
const CheckoutRecord = require('../models/CheckoutRecord');
const Book = require('../models/Book');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const User = require('../models/User');
const LibrarySettings = require('../models/LibrarySettings');

// Get all checkouts (teachers only)
router.get('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('books');
        const bookIds = user.books.map(book => book._id);

        const checkouts = await CheckoutRecord.find({ book: { $in: bookIds } })
            .populate('student', 'firstName lastName')
            .populate('book', 'title author');
        res.json(checkouts);
    } catch (error) {
        console.error('Error fetching checkouts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Checkout a book
router.post('/', authenticateToken, roleAuth(['teacher', 'student']), async (req, res) => {
    try {
        const { bookId, studentId } = req.body;

        // Validate that the student belongs to the teacher's class
        const userId = req.user.id;
        const student = await Student.findById(studentId).populate('class');
        if (!student || !student.class || student.class.teacher.toString() !== userId) {
            return res.status(403).json({ message: 'Student does not belong to your class' });
        }

        // Validate that the book belongs to the authenticated teacher's library
        const user = await User.findById(userId).populate('books');
        if (!user.books.some(book => book._id.toString() === bookId)) {
            return res.status(403).json({ message: 'You can only checkout books from your own library' });
        }

        // Retrieve the library settings
        const settings = await LibrarySettings.findOne();
        const maxCheckoutBooks = settings ? settings.maxCheckoutBooks : 5;
        const defaultDueDays = settings ? settings.defaultDueDays : 14;

        // Check if the student has reached the maximum number of checkouts
        const studentCheckouts = await CheckoutRecord.countDocuments({ student: studentId, status: 'checked out' });
        if (studentCheckouts >= maxCheckoutBooks) {
            return res.status(400).json({ message: 'Maximum number of checkouts reached for this student' });
        }

        // Find an available copy
        const book = await Book.findOne({ _id: bookId, user: userId });
        if (!book || book.copiesAvailable <= 0) {
            return res.status(400).json({ message: 'No available copies of this book' });
        }

        // Create checkout record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + defaultDueDays);

        const checkoutRecord = new CheckoutRecord({
            book: book._id,
            student: studentId,
            checkoutDate: new Date(),
            dueDate: dueDate
        });

        await checkoutRecord.save();

        // Update the book's available copies
        book.copiesAvailable -= 1;
        await book.save();

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

        const returnedOn = req.body.returnedOn;
        if (!returnedOn) {
            return res.status(400).json({ message: 'Return date is required' });
        }

        // Check if the book was already returned
        if (checkoutRecord.status === 'returned') {
            return res.status(400).json({ message: 'Book has already been returned' });
        }

        checkoutRecord.returnDate = new Date(returnedOn);
        checkoutRecord.status = 'returned';
        await checkoutRecord.save();

        // Find the associated book and update copiesAvailable
        const book = await Book.findById(checkoutRecord.book);
        if (book) {
            book.copiesAvailable += 1;
            await book.save();
        } else {
            console.error(`Book not found for checkout record ID ${checkoutRecord._id}`);
        }

        res.json({ message: 'Book returned successfully', checkoutRecord });
    } catch (error) {
        console.error('Error in return route:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Get checkout status by ISBN and studentId
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
        const teacherId = req.user.id;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const studentClass = await Class.findOne({ _id: student.class, teacher: teacherId });
        if (!studentClass) {
            return res.status(403).json({ message: 'You can only view the history of your own students' });
        }

        const checkouts = await CheckoutRecord.find({ student: studentId })
            .populate('book');

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
            .populate('book');

        res.status(200).json(checkouts);
    } catch (error) {
        console.error('Error in /student/:studentId/current route:', error);
        res.status(500).json({ message: 'Error fetching current checkouts', error: error.message });
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

        const checkoutRecord = await CheckoutRecord.findOne({
            book: book._id,
            status: 'checked out'
        });

        if (!checkoutRecord) {
            return res.status(400).json({ message: 'No active checkout found for this book' });
        }

        // Update the checkout record
        checkoutRecord.returnDate = new Date();
        checkoutRecord.status = 'returned';
        await checkoutRecord.save();

        // Update the book's available copies count
        book.copiesAvailable += 1;
        await book.save();

        res.json({ message: 'Book returned successfully', checkoutRecord });
    } catch (error) {
        console.error('Error returning book by ISBN:', error);
        res.status(500).json({ message: 'Error returning book', error: error.message });
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
            .populate('book')
            .sort({ returnDate: -1 });  // Sort by return date, most recent first

        const detailedHistory = checkouts.map(checkout => ({
            bookTitle: checkout.book.title,
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

module.exports = router;
