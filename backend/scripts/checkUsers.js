const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../src/models/User');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected for checking users'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function checkUsers() {
    try {
        const users = await User.find({}, '-password');  // Exclude password from the results
        users.forEach(user => {
        });
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers().then(() => process.exit(0));