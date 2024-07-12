//backend/src/routes/classes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Class = require('../models/Class');

// Get all classes
router.get('/', authenticateToken, roleAuth(['teacher']), async (req, res) => {
    try {
        const classes = await Class.find().populate('teacher', 'username');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new class
router.post('/', authenticateToken, roleAuth(['teacher']), async (req, res) => {
    try {
        const newClass = new Class({
            name: req.body.name,
            teacher: req.user.id,
            schoolYear: req.body.schoolYear
        });

        const savedClass = await newClass.save();
        return res.status(201).json(savedClass);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

// Update a class
router.put('/:id', authenticateToken, roleAuth(['teacher']), async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.json(updatedClass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a class
router.delete('/:id', authenticateToken, roleAuth(['teacher']), async (req, res) => {
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