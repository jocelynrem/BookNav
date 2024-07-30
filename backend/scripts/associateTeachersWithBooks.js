// scripts/associateTeachersWithBooks.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Class = require('../src/models/Class');

async function associateTeachersWithBooks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const teachers = await User.find({ role: 'teacher' });
        console.log(`Found ${teachers.length} teachers`);

        for (const teacher of teachers) {
            const classes = await Class.find({ teacher: teacher._id }).populate('books');
            console.log(`Teacher ${teacher.username} has ${classes.length} classes`);

            const bookIds = new Set();
            for (const cls of classes) {
                cls.books.forEach(book => bookIds.add(book._id.toString()));
            }

            teacher.books = Array.from(bookIds);
            await teacher.save();
            console.log(`Associated ${teacher.books.length} books with teacher ${teacher.username}`);
        }

        console.log('Teacher-book associations completed successfully');
    } catch (error) {
        console.error('Error during teacher-book association:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

associateTeachersWithBooks();