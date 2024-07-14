// backend/src/routes/classes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authenticateToken, teacherOnly } = require('../middleware/auth');
const Class = require('../models/Class');
const Student = require('../models/Student');

// Get all classes
router.get('/', authenticateToken, teacherOnly, async (req, res) => {
    try {
        const classes = await Class.find().populate('teacher', 'username');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new class
router.post(
    '/',
    authenticateToken,
    teacherOnly,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('grade').notEmpty().withMessage('Grade is required'),
        body('schoolYear').optional().isString()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newClass = new Class({
                name: req.body.name,
                teacher: req.user.id,
                grade: req.body.grade, // Ensure grade is a string
                schoolYear: req.body.schoolYear
            });

            const savedClass = await newClass.save();
            return res.status(201).json(savedClass);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
);

// Update a class
router.put(
    '/:id',
    authenticateToken,
    teacherOnly,
    [
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('grade').optional().notEmpty().withMessage('Grade cannot be empty'),
        body('schoolYear').optional().isString()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedClass) {
                return res.status(404).json({ message: 'Class not found' });
            }
            res.json(updatedClass);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Delete a class
router.delete('/:id', authenticateToken, teacherOnly, async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.json({ message: 'Class deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
