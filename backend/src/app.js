// backend/src/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookRouter = require('./routes/books');
const authRouter = require('./routes/auth');
const classRouter = require('./routes/classes');
const studentRouter = require('./routes/students');
const checkoutRouter = require('./routes/checkouts');

const app = express();

// Load appropriate .env file based on environment
if (process.env.NODE_ENV === 'test') {
    require('dotenv').config({ path: '.env.test' });
    console.log('Running in test environment');
} else {
    require('dotenv').config();
    console.log('Running in production environment');
}

const mongoUri = process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;
console.log(`MongoDB URI: ${mongoUri}`);

mongoose.connect(mongoUri)
    .then(() => console.log(`MongoDB connected to ${process.env.NODE_ENV === 'test' ? 'test' : 'production'} database`))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://booknav-sepia.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(express.json());

app.use('/api/books', bookRouter);
app.use('/api/auth', authRouter);
app.use('/api/classes', classRouter);
app.use('/api/students', studentRouter);
app.use('/api/checkouts', checkoutRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the BookNav API!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;
