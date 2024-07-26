// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Book = require('../models/Book');
const CheckoutRecord = require('../models/CheckoutRecord');
const Student = require('../models/Student');
const moment = require('moment');

// Get overview statistics
router.get('/stats', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const checkedOutBooks = await CheckoutRecord.countDocuments({ status: 'checked out' });
        const overdueBooks = await CheckoutRecord.countDocuments({
            status: 'checked out',
            dueDate: { $lt: new Date() }
        });
        const dueTodayBooks = await CheckoutRecord.countDocuments({
            status: 'checked out',
            dueDate: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999)
            }
        });

        res.json({
            totalBooks,
            checkedOutBooks,
            overdueBooks,
            dueTodayBooks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const recentCheckouts = await CheckoutRecord.find({ status: 'checked out' })
            .sort('-checkoutDate')
            .limit(5)
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: {
                    path: 'book',
                    select: 'title'
                }
            });

        const recentReturns = await CheckoutRecord.find({ status: 'returned' })
            .sort('-returnDate')
            .limit(5)
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: {
                    path: 'book',
                    select: 'title'
                }
            });

        const activity = [...recentCheckouts, ...recentReturns]
            .sort((a, b) => b.checkoutDate - a.checkoutDate)
            .slice(0, 5)
            .map(record => ({
                action: record.status === 'checked out' ? 'Checkout' : 'Return',
                details: `${record.student.firstName} ${record.student.lastName} - ${record.bookCopy && record.bookCopy.book ? record.bookCopy.book.title : 'Unknown Book (Deleted)'}`,
                time: moment(record.status === 'checked out' ? record.checkoutDate : record.returnDate).format('MMMM D, YYYY, h:mm A')
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
        const popularBooks = await CheckoutRecord.aggregate([
            { $match: { status: 'checked out' } },
            { $group: { _id: '$bookCopy.book', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'bookDetails' } },
            { $unwind: '$bookDetails' },
            { $project: { name: '$bookDetails.title', checkouts: '$count' } }
        ]);

        res.json({ popularBooks });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
            .populate('bookCopy', 'book')
            .populate('bookCopy.book', 'title');

        const formattedDueDates = upcomingDueDates.map(record => ({
            book: record.bookCopy.book.title,
            date: record.dueDate.toLocaleDateString(),
            student: `${record.student.firstName} ${record.student.lastName}`
        }));

        res.json(formattedDueDates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;