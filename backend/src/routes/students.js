// backend/src/routes/students.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Student = require('../models/Student');
const Class = require('../models/Class');
const CheckoutRecord = require('../models/CheckoutRecord');

// Get all students for the authenticated teacher
router.get('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.id }).select('_id');
        const classIds = classes.map(cls => cls._id);

        const students = await Student.find({ class: { $in: classIds } }).populate('class', 'name');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get students by class for the authenticated teacher
router.get('/class/:classId', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { classId } = req.params;
        let students;

        if (classId === 'all') {
            const classes = await Class.find({ teacher: req.user.id }).select('_id');
            const classIds = classes.map(cls => cls._id);
            students = await Student.find({ class: { $in: classIds } }).populate('class', 'name');
        } else {
            const classData = await Class.findOne({ _id: classId, teacher: req.user.id });
            if (!classData) {
                return res.status(404).json({ message: 'Class not found or not authorized' });
            }
            students = await Student.find({ class: classId }).populate('class', 'name');
        }

        res.json(students);
    } catch (error) {
        console.error('Failed to fetch students by class:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new student
router.post('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const classData = await Class.findOne({ _id: req.body.classId, teacher: req.user.id });
        if (!classData) {
            return res.status(400).json({ message: 'Class not found or not authorized' });
        }

        const existingStudent = await Student.findOne({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            class: req.body.classId
        });

        if (existingStudent) {
            return res.status(400).json({ message: 'A student with this name already exists in the class' });
        }

        const newStudent = new Student({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            grade: classData.grade,
            class: req.body.classId,
            pin: req.body.pin,
            readingLevel: req.body.readingLevel
        });

        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(400).json({ message: error.message });
    }
});

// Bulk create students
router.post('/bulk-create', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const studentsData = req.body;
        if (!Array.isArray(studentsData) || studentsData.length === 0) {
            return res.status(400).json({ message: 'Invalid input. Expected an array of student objects.' });
        }

        const createdStudents = await bulkCreateStudents(studentsData, req.user.id);

        res.status(201).json({
            message: `Successfully created ${createdStudents.length} students`,
            students: createdStudents
        });
    } catch (error) {
        console.error('Failed to bulk create students:', error);
        res.status(500).json({ message: 'Error creating students', error: error.message });
    }
});

async function bulkCreateStudents(studentsData, teacherId) {
    const createdStudents = [];
    for (const data of studentsData) {
        try {
            const classData = await Class.findOne({ _id: data.classId, teacher: teacherId });
            if (!classData) {
                throw new Error(`Class not found for student: ${data.firstName} ${data.lastName}`);
            }

            const existingStudent = await Student.findOne({
                firstName: data.firstName,
                lastName: data.lastName,
                class: data.classId,
                readingLevel: req.body.readingLevel
            });

            if (existingStudent) {
                throw new Error(`A student with this name already exists in the class: ${data.firstName} ${data.lastName}`);
            }

            const newStudent = new Student({
                firstName: data.firstName,
                lastName: data.lastName,
                grade: classData.grade,
                class: data.classId,
                pin: data.pin
            });

            const savedStudent = await newStudent.save();
            createdStudents.push(savedStudent);
        } catch (error) {
            console.error(`Error creating student: ${data.firstName} ${data.lastName}`, error);
        }
    }
    return createdStudents;
}

// Update a student
router.put('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const classData = await Class.findOne({ _id: student.class, teacher: req.user.id });
        if (!classData) {
            return res.status(403).json({ message: 'Not authorized to update student' });
        }

        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a student
router.delete('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const classData = await Class.findOne({ _id: student.class, teacher: req.user.id });
        if (!classData) {
            return res.status(403).json({ message: 'Not authorized to delete student' });
        }

        await Student.deleteOne({ _id: req.params.id });
        res.json({ message: 'Student deleted' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get reading history for a student
router.get('/:id/reading-history', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const classData = await Class.findOne({ _id: student.class, teacher: req.user.id });
        if (!classData) {
            return res.status(403).json({ message: 'Not authorized to view reading history for this student' });
        }

        const readingHistory = await CheckoutRecord.find({
            student: studentId,
            status: 'returned'
        })
            .sort({ returnDate: -1 })
            .populate('book', 'title');

        const formattedHistory = readingHistory.map(record => ({
            bookTitle: record.book ? record.book.title : 'Unknown Book',
            checkoutDate: record.checkoutDate,
            returnDate: record.returnDate,
            durationMinutes: Math.round((record.returnDate - record.checkoutDate) / (1000 * 60))
        }));

        res.json(formattedHistory);
    } catch (error) {
        console.error('Error fetching reading history:', error);
        res.status(500).json({ message: 'Error fetching reading history', error: error.message });
    }
});


module.exports = router;
