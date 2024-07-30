// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const CheckoutRecord = require('../models/CheckoutRecord');
const User = require('../models/User');
const moment = require('moment');
const BookCopy = require('../models/BookCopy')

// Get overview statistics
router.get('/stats', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('books');
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.books || user.books.length === 0) {
            return res.json({
                totalBooks: 0,
                checkedOutBooks: 0,
                overdueBooks: 0
            });
        }

        const bookIds = user.books.map(book => book._id);

        // First, let's check all BookCopy documents for these books
        const bookCopies = await BookCopy.find({ book: { $in: bookIds } });

        const bookCopyIds = bookCopies.map(copy => copy._id);

        const [totalBooks, checkedOutBooks, overdueBooks] = await Promise.all([
            user.books.length,
            CheckoutRecord.countDocuments({
                bookCopy: { $in: bookCopyIds },
                status: 'checked out'
            }),
            CheckoutRecord.countDocuments({
                bookCopy: { $in: bookCopyIds },
                status: 'checked out',
                dueDate: { $lt: new Date() }
            })
        ]);

        res.json({
            totalBooks,
            checkedOutBooks,
            overdueBooks
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('books');
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.books || user.books.length === 0) {
            return res.json([]);
        }

        const bookIds = user.books.map(book => book._id);
        const bookCopies = await BookCopy.find({ book: { $in: bookIds } });
        const bookCopyIds = bookCopies.map(copy => copy._id);

        const limit = 50;

        const recentCheckouts = await CheckoutRecord.find({
            bookCopy: { $in: bookCopyIds }
        })
            .sort('-checkoutDate')
            .limit(limit)
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title _id' }
            });

        const recentReturns = await CheckoutRecord.find({
            bookCopy: { $in: bookCopyIds },
            returnDate: { $ne: null }
        })
            .sort('-returnDate')
            .limit(limit)
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title _id' }
            });

        const activity = [...recentCheckouts, ...recentReturns]
            .sort((a, b) => {
                const dateA = a.returnDate || a.checkoutDate;
                const dateB = b.returnDate || b.checkoutDate;
                return dateB - dateA;
            })
            .slice(0, limit)
            .map(record => ({
                action: record.returnDate ? 'Return' : 'Checkout',
                details: `${record.student.firstName} ${record.student.lastName} - ${record.bookCopy.book ? record.bookCopy.book.title : 'Unknown Book'}`,
                time: moment(record.returnDate || record.checkoutDate).format('MMMM D, YYYY, h:mm A'),
                checkoutId: record._id,
                bookId: record.bookCopy.book ? record.bookCopy.book._id : null
            }));

        res.json(activity);
    } catch (error) {
        console.error('Error in recent-activity route:', error);
        res.status(500).json({ message: error.message });
    }
});


// Get reading trends
router.get('/reading-trends', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('books');
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.books || user.books.length === 0) {
            return res.json({ popularBooks: [], averageCheckoutDuration: 0 });
        }

        const bookIds = user.books.map(book => book._id);
        const bookCopies = await BookCopy.find({ book: { $in: bookIds } });
        const bookCopyIds = bookCopies.map(copy => copy._id);
        const [popularBooks, averageCheckoutDuration] = await Promise.all([
            CheckoutRecord.aggregate([
                { $match: { bookCopy: { $in: bookCopyIds } } },
                { $lookup: { from: 'bookcopies', localField: 'bookCopy', foreignField: '_id', as: 'bookCopyDetails' } },
                { $unwind: '$bookCopyDetails' },
                { $lookup: { from: 'books', localField: 'bookCopyDetails.book', foreignField: '_id', as: 'bookDetails' } },
                { $unwind: '$bookDetails' },
                {
                    $group: {
                        _id: '$bookDetails._id',
                        name: { $first: '$bookDetails.title' },
                        checkouts: { $sum: 1 }
                    }
                },
                { $sort: { checkouts: -1 } },
                { $limit: 5 }
            ]),
            CheckoutRecord.aggregate([
                { $match: { status: 'returned', bookCopy: { $in: bookCopyIds } } },
                {
                    $group: {
                        _id: null,
                        avgDuration: { $avg: { $subtract: ['$returnDate', '$checkoutDate'] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        avgDurationInDays: { $divide: ['$avgDuration', 1000 * 60 * 60 * 24] }
                    }
                }
            ])
        ]);

        res.json({
            popularBooks,
            averageCheckoutDuration: averageCheckoutDuration[0]?.avgDurationInDays || 0
        });
    } catch (error) {
        console.error('Error retrieving reading trends:', error);
        res.status(500).json({ message: 'Failed to fetch reading trends', error: error.message });
    }
});

// Get upcoming due dates
router.get('/upcoming-due-dates', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('books');
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }


        if (!user.books || user.books.length === 0) {
            return res.json([]);
        }

        const bookIds = user.books.map(book => book._id);
        const bookCopies = await BookCopy.find({ book: { $in: bookIds } });
        const bookCopyIds = bookCopies.map(copy => copy._id);
        const upcomingDueDates = await CheckoutRecord.find({
            bookCopy: { $in: bookCopyIds },
            status: 'checked out',
            dueDate: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            }
        })
            .sort('dueDate')
            .limit(10)
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title' }
            });

        const formattedDueDates = upcomingDueDates.map(record => ({
            book: record.bookCopy?.book?.title || 'Unknown Title',
            date: record.dueDate ? record.dueDate.toLocaleDateString() : 'Unknown Date',
            student: record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown Student'
        }));

        res.json(formattedDueDates);
    } catch (error) {
        console.error('Error fetching upcoming due dates:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get overdue books
router.get('/overdue-books', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('books');
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.books || user.books.length === 0) {
            return res.json([]);
        }

        const bookIds = user.books.map(book => book._id);
        const bookCopies = await BookCopy.find({ book: { $in: bookIds } });
        const bookCopyIds = bookCopies.map(copy => copy._id);
        const overdueBooks = await CheckoutRecord.find({
            bookCopy: { $in: bookCopyIds },
            status: 'checked out',
            dueDate: { $lt: new Date() }
        })
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title' }
            })
            .lean();

        const formattedOverdueBooks = overdueBooks.map(record => ({
            _id: record._id,
            student: record.student,
            bookCopy: record.bookCopy,
            daysOverdue: Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24))
        }));

        res.json(formattedOverdueBooks);
    } catch (error) {
        console.error('Error fetching overdue books:', error);
        res.status(500).json({ message: 'Error fetching overdue books', error: error.message });
    }
});

module.exports = router;