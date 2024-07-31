require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookRouter = require('./routes/books');
const authRouter = require('./routes/auth');
const classRouter = require('./routes/classes');
const studentRouter = require('./routes/students');
const checkoutRouter = require('./routes/checkouts');
const dashboardRouter = require('./routes/dashboard');
const libraryRouter = require('./routes/library');
require('./models/LibrarySettings');

const app = express();

// Load appropriate .env file based on environment
switch (process.env.NODE_ENV) {
    case 'development':
        require('dotenv').config({ path: '.env' });
        console.log('Running in development environment');
        break;
    case 'staging':
        require('dotenv').config({ path: '.env.staging' });
        console.log('Running in staging environment');
        break;
    case 'production':
        require('dotenv').config({ path: '.env.production' });
        console.log('Running in production environment');
        break;
    default:
        console.error('No valid NODE_ENV set');
        process.exit(1);
}

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
    .then(() => console.log(`MongoDB connected to ${process.env.NODE_ENV} database`))
    .catch(err => console.error('MongoDB connection error:', err));
console.log("mongoUri: ", mongoUri)

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://booknav-sepia.vercel.app',
    'https://librarynav.com',
    'https://www.librarynav.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

// Router middleware
app.use('/api/books', bookRouter);
app.use('/api/auth', authRouter);
app.use('/api/classes', classRouter);
app.use('/api/students', studentRouter);
app.use('/api/checkouts', checkoutRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/library', libraryRouter);

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Welcome to the BookNav API!');
});

// Catch-all route
app.use('*', (req, res) => {
    res.status(404).send('Route not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;
