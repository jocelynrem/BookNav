// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const authenticateToken = async (req, res, next) => {
    if (req.path === '/manifest.json') {
        return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.error('No token provided');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    if (/^\d{4}$/.test(token)) {
        try {
            const student = await Student.findOne({ pin: token });
            if (student) {
                req.user = { id: student._id, role: 'student' };
                return next();
            } else {
                console.error('No student found with this PIN');
                return res.status(401).json({ error: 'Invalid PIN' });
            }
        } catch (error) {
            console.error('Error during student authentication:', error);
            return res.status(500).json({ error: 'Server error during authentication' });
        }
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (err) {
            console.error('JWT verification failed:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
};

const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        return next();
    }
    console.error('Access denied. Teachers only.');
    return res.status(403).json({ error: 'Access denied. Teachers only.' });
};

module.exports = { authenticateToken, teacherOnly };
