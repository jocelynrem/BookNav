// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Book = require('../models/Book');
const CheckoutRecord = require('../models/CheckoutRecord');
const Student = require('../models/Student');
const moment = require('moment');

// Get overdue books
router.get('/overdue-books', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const overdueBooks = await CheckoutRecord.find({
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

// Get overview statistics
router.get('/stats', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const checkedOutBooks = await CheckoutRecord.countDocuments({ status: 'checked out' });
        const overdueBooks = await CheckoutRecord.countDocuments({
            status: 'checked out',
            dueDate: { $lt: new Date() }
        });

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
        const limit = 50; // Set the limit to 50 for both checkouts and returns

        const recentCheckouts = await CheckoutRecord.find({ status: 'checked out' })
            .sort('-checkoutDate')
            .limit(limit)
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: {
                    path: 'book',
                    select: 'title _id'
                }
            });

        const recentReturns = await CheckoutRecord.find({ status: 'returned' })
            .sort('-returnDate')
            .limit(limit)
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: {
                    path: 'book',
                    select: 'title _id'
                }
            });

        const activity = [...recentCheckouts, ...recentReturns]
            .sort((a, b) => {
                const dateA = a.status === 'checked out' ? a.checkoutDate : a.returnDate;
                const dateB = b.status === 'checked out' ? b.checkoutDate : b.returnDate;
                return dateB - dateA;
            })
            .map(record => ({
                action: record.status === 'checked out' ? 'Checkout' : 'Return',
                details: `${record.student.firstName} ${record.student.lastName} - ${record.bookCopy && record.bookCopy.book ? record.bookCopy.book.title : 'Unknown Book (Deleted)'}`,
                time: moment(record.status === 'checked out' ? record.checkoutDate : record.returnDate).format('MMMM D, YYYY, h:mm A'),
                checkoutId: record._id,
                bookId: record.bookCopy && record.bookCopy.book ? record.bookCopy.book._id : null
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
        const [popularBooks, averageCheckoutDuration, topStudents, longestDurationBooks, shortestDurationBooks] = await Promise.all([
            CheckoutRecord.aggregate([
                { $match: { status: 'checked out' } },
                { $group: { _id: '$bookCopy.book', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'bookDetails' } },
                { $unwind: '$bookDetails' },
                { $project: { name: '$bookDetails.title', checkouts: '$count' } }
            ]),
            CheckoutRecord.aggregate([
                { $match: { status: 'returned' } },
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
            ]),
            CheckoutRecord.aggregate([
                { $group: { _id: '$student', count: { $sum: 1 }, avgDuration: { $avg: { $subtract: ['$returnDate', '$checkoutDate'] } } } },
                { $sort: { count: -1 } },
                { $limit: 3 },
                { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'studentDetails' } },
                { $unwind: '$studentDetails' },
                { $project: { studentName: { $concat: ['$studentDetails.firstName', ' ', '$studentDetails.lastName'] }, checkouts: '$count', avgDurationInDays: { $divide: ['$avgDuration', 1000 * 60 * 60 * 24] } } }
            ]),
            CheckoutRecord.aggregate([
                { $match: { status: 'returned' } },
                { $project: { book: '$bookCopy.book', duration: { $subtract: ['$returnDate', '$checkoutDate'] } } },
                { $sort: { duration: -1 } },
                { $limit: 1 },
                { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'bookDetails' } },
                { $unwind: '$bookDetails' },
                { $project: { name: '$bookDetails.title', durationInDays: { $divide: ['$duration', 1000 * 60 * 60 * 24] } } }
            ]),
            CheckoutRecord.aggregate([
                { $match: { status: 'returned' } },
                { $project: { book: '$bookCopy.book', duration: { $subtract: ['$returnDate', '$checkoutDate'] } } },
                { $sort: { duration: 1 } },
                { $limit: 1 },
                { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'bookDetails' } },
                { $unwind: '$bookDetails' },
                { $project: { name: '$bookDetails.title', durationInDays: { $divide: ['$duration', 1000 * 60 * 60 * 24] } } }
            ])
        ]);

        // Log the retrieved data for debugging purposes
        console.log('Reading Trends Data:', {
            popularBooks,
            averageCheckoutDuration,
            topStudents,
            longestDurationBooks,
            shortestDurationBooks
        });

        // Return the aggregated data in a consistent JSON format
        res.status(200).json({
            popularBooks,
            averageCheckoutDuration,
            topStudents,
            longestDurationBooks,
            shortestDurationBooks
        });
    } catch (error) {
        // Log the error and send a 500 response with the error message in JSON format
        console.error('Error retrieving reading trends:', error);
        res.status(500).json({ message: 'Failed to fetch reading trends', error: error.message });
    }
});

// Get upcoming due dates
router.get('/upcoming-due-dates', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const upcomingDueDates = await CheckoutRecord.find({
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
                populate: {
                    path: 'book',
                    select: 'title'
                }
            });

        const formattedDueDates = upcomingDueDates.map(record => ({
            book: record.bookCopy?.book?.title || 'Unknown Title',
            date: record.dueDate ? record.dueDate.toLocaleDateString() : 'Unknown Date',
            student: record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown Student'
        }));

        res.json(formattedDueDates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;