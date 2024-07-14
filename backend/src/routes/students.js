// backend/src/routes/students.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Student = require('../models/Student');
const Class = require('../models/Class');

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
        const students = await Student.find({ class: req.params.classId }).populate('class', 'name');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new student
router.post('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const studentClass = await Class.findById(req.body.classId);
        if (!studentClass) {
            console.log('Class not found:', req.body.classId);
            return res.status(400).json({ message: 'Class not found' });
        }

        // Check if a student with the same name already exists in the class
        const existingStudent = await Student.findOne({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            class: req.body.classId
        });

        if (existingStudent) {
            console.log('Duplicate student found:', existingStudent);
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
        console.log('New student created:', savedStudent);
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

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (let studentData of studentsData) {
            try {
                const studentClass = await Class.findById(studentData.classId);
                if (!studentClass) {
                    throw new Error('Class not found');
                }

                const newStudent = new Student({
                    firstName: studentData.firstName,
                    lastName: studentData.lastName,
                    grade: studentClass.grade, // Set grade from class
                    class: studentData.classId,
                    pin: studentData.pin || '0000' // Default PIN if not provided
                });

                await newStudent.save();
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Failed to create student ${studentData.firstName} ${studentData.lastName}: ${error.message}`);
            }
        }

        res.status(201).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

module.exports = router;
