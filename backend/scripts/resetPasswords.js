const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function resetPasswords() {
    try {
        const users = await User.find({});
        for (let user of users) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('temporaryPassword123', salt);
            await user.save();
        }
    } catch (error) {
        console.error('Error resetting passwords:', error);
    } finally {
        mongoose.disconnect();
    }
}

resetPasswords();