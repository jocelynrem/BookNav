const mongoose = require('mongoose');
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
    .then(() => console.log('MongoDB connected for migration'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function migrateUserRoles() {
    try {
        const users = await User.find({ role: { $exists: false } });
        console.log(`Found ${users.length} users without a role`);

        for (let user of users) {
            user.role = 'student'; // Default role, adjust as needed
            await user.save();
            console.log(`Updated user ${user.username} with role: student`);
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

migrateUserRoles().then(() => process.exit(0));