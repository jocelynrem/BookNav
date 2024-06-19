const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bookRouter = require('./routes/books');

dotenv.config();
const app = express();

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

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

app.get('/', (req, res) => {
    res.send('Welcome to the BookNav API!');
});

module.exports = app;
