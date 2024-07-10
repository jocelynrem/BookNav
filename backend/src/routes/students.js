const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Student = require('../models/Student');

// Get all students
router.get('/', authenticateToken, async (req, res) => {
    try {
        const students = await Student.find().populate('class', 'name');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new student
router.post('/', authenticateToken, async (req, res) => {
    const newStudent = new Student({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        studentId: req.body.studentId,
        grade: req.body.grade,
        class: req.body.classId
    });

    try {
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a student
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a student
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get student reading history
router.get('/:id/reading-history', authenticateToken, async (req, res) => {
    try {
        const checkoutRecords = await CheckoutRecord.find({ student: req.params.id })
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