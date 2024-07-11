//backend/src/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configure Nodemailer to use SendGrid
const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
        user: 'apikey', // This is the literal string 'apikey', not your username
        pass: process.env.SENDGRID_API_KEY,
    },
});

// Initiate password reset
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        try {
            await user.save();
        } catch (saveError) {
            console.error('Error saving user with reset token:', saveError);
            return res.status(500).json({ error: 'Error saving reset token' });
        }

        const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

        const msg = {
            to: user.email,
            from: process.env.SENDGRID_EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset your password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
            html: `<p>You are receiving this because you (or someone else) have requested to reset your password.</p>
                   <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
        };

        await sgMail.send(msg);
        res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// Reset password with token
router.post('/reset/:token', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (user) {

        } else {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
        }

        // Update user's password
        user.password = password; // The pre-save hook will hash this
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ error: 'Error in resetting password' });
    }
});

// Update user information
router.put('/update', authenticateToken, async (req, res) => {
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
});

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        const user = new User({ username, password, email, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error registering user:', err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = user.generateJWT();
        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a user
router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get list of users (for admin purposes, secured route)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({}, 'username email createdAt');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
