// In your dashboard.js route file

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const CheckoutRecord = require('../models/CheckoutRecord');
const User = require('../models/User');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const Class = require('../models/Class');
const Student = require('../models/Student');
const moment = require('moment');

// Helper function to get teacher's students
async function getTeacherStudents(userId) {
    const teacherClasses = await Class.find({ teacher: userId });
    const classIds = teacherClasses.map(c => c._id);
    return await Student.find({ class: { $in: classIds } });
}

// Get recent activity
router.get('/recent-activity', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;
        const students = await getTeacherStudents(userId);
        const studentIds = students.map(s => s._id);

        const recentActivity = await CheckoutRecord.find({
            student: { $in: studentIds }
        })
            .sort('-checkoutDate')
            .limit(50)
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title _id' }
            });

        const activity = recentActivity.map(record => {
            if (!record.bookCopy || !record.bookCopy.book) {
                return null;
            }
            return {
                action: record.status === 'checked out' ? 'Checkout' : 'Return',
                details: `${record.student.firstName} ${record.student.lastName} - ${record.bookCopy.book.title}`,
                time: moment(record.status === 'checked out' ? record.checkoutDate : record.returnDate).format('MMMM D, YYYY, h:mm A'),
                checkoutId: record._id,
                bookId: record.bookCopy.book._id
            };
        }).filter(Boolean);  // Remove any null entries

        res.json(activity);
    } catch (error) {
        console.error('Error in recent-activity route:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
});

// Get overview statistics
router.get('/stats', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;

        // Get teacher's classes
        const teacherClasses = await Class.find({ teacher: userId });
        const classIds = teacherClasses.map(c => c._id);

        // Get students in these classes
        const students = await Student.find({ class: { $in: classIds } });
        const studentIds = students.map(s => s._id);

        // Get total books associated with the teacher
        const teacher = await User.findById(userId).populate('books');
        const totalBooks = teacher.books.length;

        const [checkedOutBooks, overdueBooks] = await Promise.all([
            CheckoutRecord.countDocuments({
                student: { $in: studentIds },
                status: 'checked out'
            }),
            CheckoutRecord.countDocuments({
                student: { $in: studentIds },
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

// Get reading trends
router.get('/reading-trends', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;

        const students = await getTeacherStudents(userId);
        const studentIds = students.map(s => s._id);

        const [popularBooks, averageCheckoutDuration] = await Promise.all([
            CheckoutRecord.aggregate([
                { $match: { student: { $in: studentIds } } },
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
                { $match: { status: 'returned', student: { $in: studentIds } } },
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
        const students = await getTeacherStudents(userId);
        const studentIds = students.map(s => s._id);

        const upcomingDueDates = await CheckoutRecord.find({
            student: { $in: studentIds },
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
        const students = await getTeacherStudents(userId);
        const studentIds = students.map(s => s._id);

        const overdueBooks = await CheckoutRecord.find({
            student: { $in: studentIds },
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

// Get checked out books
router.get('/checked-out-books', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;
        const students = await getTeacherStudents(userId);
        const studentIds = students.map(s => s._id);

        const checkedOutBooks = await CheckoutRecord.find({
            student: { $in: studentIds },
            status: 'checked out'
        })
            .populate('student', 'firstName lastName')
            .populate({
                path: 'bookCopy',
                populate: { path: 'book', select: 'title' }
            })
            .lean();

        const formattedCheckedOutBooks = checkedOutBooks.map(record => ({
            _id: record._id,
            title: record.bookCopy?.book?.title || 'Unknown Title',
            student: record.student
                ? `${record.student.firstName} ${record.student.lastName}`
                : 'Unknown Student',
            dueDate: record.dueDate
        }));

        res.json(formattedCheckedOutBooks);
    } catch (error) {
        console.error('Error fetching checked out books:', error);
        res.status(500).json({ message: 'Error fetching checked out books', error: error.message });
    }
});

module.exports = router;