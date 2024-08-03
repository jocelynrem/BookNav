//backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
});

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({
            username,
            password,
            email,
            role: 'teacher'  // Always set role to 'teacher'
        });
        await user.save();

        // Generate a JWT token for the new user
        const token = user.generateJWT();

        // Return only necessary user information
        res.status(201).json({
            message: 'Teacher account created successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (err) {
        console.error('Error registering teacher:', err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password. Please try again.' });
        }

        const token = user.generateJWT();
        res.json({ token, role: user.role });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'An error occurred while trying to log in. Please try again later.' });
    }
});

// Initiate password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

        const msg = {
            to: user.email,
            from: process.env.SENDGRID_EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this because you have requested to reset your password. Please use the following link to reset your password: ${resetUrl}`,
            html: `<p>You have requested to reset your password.</p>
                   <p>Please click on the following link to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>`
        };

        await sgMail.send(msg);

        res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// Reset password with token
router.post('/reset/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        // Hash the token from the URL
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        // Set the new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Your password has been reset successfully' });
    } catch (error) {
        console.error('Error in password reset:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Update user information
router.put('/update', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ message: 'User information updated' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user information' });
    }
});

// Delete a user
router.delete('/delete', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Get list of users (for admin purposes, secured route)
router.get('/users', authenticateToken, roleAuth(['admin', 'teacher']), async (req, res) => {
    try {
        const users = await User.find({}, 'username email createdAt role');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

module.exports = router;