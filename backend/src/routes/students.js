// backend/src/routes/students.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Student = require('../models/Student');
const Class = require('../models/Class');
const ReadingHistory = require('../models/ReadingHistory');

// Get all students
router.get('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const students = await Student.find().populate('class', 'name');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get students by class
router.get('/class/:classId', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { classId } = req.params;
        let students;
        if (classId === 'all') {
            students = await Student.find().populate('class', 'name');
        } else {
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
        const studentClass = await Class.findById(req.body.classId);
        if (!studentClass) {
            return res.status(400).json({ message: 'Class not found' });
        }

        // Check if a student with the same name already exists in the class
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
            grade: studentClass.grade,
            class: req.body.classId,
            pin: req.body.pin
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

        const createdStudents = await bulkCreateStudents(studentsData);

        res.status(201).json({
            message: `Successfully created ${createdStudents.length} students`,
            students: createdStudents
        });
    } catch (error) {
        console.error('Failed to bulk create students:', error);
        res.status(500).json({ message: 'Error creating students', error: error.message });
    }
});

async function bulkCreateStudents(studentsData) {
    const createdStudents = [];
    for (const data of studentsData) {
        try {
            const studentClass = await Class.findById(data.classId);
            if (!studentClass) {
                throw new Error(`Class not found for student: ${data.firstName} ${data.lastName}`);
            }

            // Check for existing student with the same name in the same class
            const existingStudent = await Student.findOne({
                firstName: data.firstName,
                lastName: data.lastName,
                class: data.classId
            });

            if (existingStudent) {
                throw new Error(`A student with this name already exists in the class: ${data.firstName} ${data.lastName}`);
            }

            const newStudent = new Student({
                firstName: data.firstName,
                lastName: data.lastName,
                grade: studentClass.grade,
                class: data.classId,
                pin: data.pin
            });

            const savedStudent = await newStudent.save();
            createdStudents.push(savedStudent);
        } catch (error) {
            console.error(`Error creating student: ${data.firstName} ${data.lastName}`, error);
            // Continue with the next student
        }
    }
    return createdStudents;
}

// Update a student
router.put('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(updatedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a student
router.delete('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reading history for a student
router.get('/:id/reading-history', authenticateToken, roleAuth('teacher'), async (req, res) => {
    console.log('Reading history route hit');
    try {
        const studentId = req.params.id;
        console.log(`Fetching reading history for student ID: ${studentId}`);
        const readingHistory = await ReadingHistory.find({ student: studentId }).sort({ date: -1 });
        console.log('Reading history found:', readingHistory);
        res.json(readingHistory);
    } catch (error) {
        console.error('Error fetching reading history:', error);
        res.status(500).json({ message: 'Error fetching reading history', error: error.message });
    }
});

module.exports = router;
