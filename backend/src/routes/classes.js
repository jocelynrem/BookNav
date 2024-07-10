const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Class = require('../models/Class');

// Get all classes
router.get('/', authenticateToken, async (req, res) => {
    try {
        const classes = await Class.find().populate('teacher', 'username');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new class
router.post('/', authenticateToken, async (req, res) => {
    const newClass = new Class({
        name: req.body.name,
        teacher: req.user.id,
        schoolYear: req.body.schoolYear
    });

    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a class
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedClass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a class
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;