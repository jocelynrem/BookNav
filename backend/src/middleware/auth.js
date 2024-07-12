// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // First, try to verify as a JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        // If JWT verification fails, try to authenticate as a student using PIN
        try {
            const student = await Student.findOne({ pin: token });
            if (student) {
                req.user = { id: student._id, role: 'student' };
                return next();
            }
        } catch (error) {
            // If student lookup fails, return a server error
            return res.status(500).json({ error: 'Server error during authentication' });
        }
    }

    // If both JWT and PIN authentication fail, return an invalid token error
    return res.status(401).json({ error: 'Invalid token' });
};

module.exports = { authenticateToken };