const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../src/models/User');

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected for creating test users'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function createTestUsers() {
    try {
        const testUsers = [
            { username: 'testteacher', email: 'teacher@test.com', password: 'password123', role: 'teacher' },
            { username: 'teststudent', email: 'student@test.com', password: 'password123', role: 'student' },
            { username: 'username', email: 'password@test.com', password: 'password', role: 'teacher' },
        ];

        for (let userData of testUsers) {
            try {
                const existingUser = await User.findOne({ email: userData.email });
                if (existingUser) {
                    console.log(`User with email ${userData.email} already exists. Skipping.`);
                    continue;
                }

                const newUser = new User({
                    username: userData.username,
                    email: userData.email,
                    password: userData.password,  // The pre-save hook will hash this
                    role: userData.role
                });

                await newUser.save();
                console.log(`Created test user: ${userData.username} with role ${userData.role}`);
            } catch (error) {
                console.error(`Error creating user ${userData.username}:`, error.message);
            }
        }

        console.log('Test user creation process completed');
    } catch (error) {
        console.error('Error in createTestUsers function:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

createTestUsers().then(() => process.exit(0));