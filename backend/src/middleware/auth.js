// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const authenticateToken = async (req, res, next) => {
    // Allow public access to manifest.json
    if (req.path === '/manifest.json') {
        return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Check if it's a 4-digit PIN (for students)
    if (/^\d{4}$/.test(token)) {
        try {
            const student = await Student.findOne({ pin: token });
            if (student) {
                req.user = { id: student._id, role: 'student' };
                return next();
            }
        } catch (error) {
            console.error('Error during student authentication:', error);
            return res.status(500).json({ error: 'Server error during authentication' });
        }
    } else {
        // Assume it's a JWT token (for teachers)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (err) {
            console.error('JWT verification failed:', err);
        }
    }

    // If we reach here, authentication failed
    return res.status(401).json({ error: 'Invalid token' });
};

// Optional: Middleware to ensure only teachers can access certain routes
const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Teachers only.' });
};

module.exports = { authenticateToken, teacherOnly };