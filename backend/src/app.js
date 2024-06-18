const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bookRouter = require('./routes/books');

dotenv.config();
const app = express();

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const allowedOrigins = ['http://localhost:3000', 'https://booknav-sepia.vercel.app'];

app.use(cors({
    origin: allowedOrigins,
}));

app.use(express.json());
app.use('/api/books', bookRouter);

module.exports = app;
