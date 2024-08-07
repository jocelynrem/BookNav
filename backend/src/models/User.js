// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['teacher', 'student'],
        default: 'teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

// Method to generate JWT token
userSchema.methods.generateJWT = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Method to associate a book with a user
userSchema.methods.addBook = async function (bookId) {
    if (!this.books.includes(bookId)) {
        this.books.push(bookId);
        await this.save();
    }
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    return resetToken;
};

userSchema.statics.findByPasswordResetToken = function (token) {
    return this.findOne({
        resetPasswordToken: crypto.createHash('sha256').update(token).digest('hex'),
        resetPasswordExpires: { $gt: Date.now() }
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
