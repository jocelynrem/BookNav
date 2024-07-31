// backend/src/routes/books.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const CheckoutRecord = require('../models/CheckoutRecord');


router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const books = await Book.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } },
                { isbn: { $regex: q, $options: 'i' } }
            ]
        }).limit(20);

        // Calculate available copies for each book
        const booksWithAvailability = await Promise.all(books.map(async book => {
            const totalCopies = await BookCopy.countDocuments({ book: book._id });
            const checkedOutCount = await CheckoutRecord.countDocuments({
                bookCopy: { $in: (await BookCopy.find({ book: book._id })).map(copy => copy._id) },
                status: 'checked out'
            });

            const availableCopies = totalCopies - checkedOutCount;

            return {
                ...book.toObject(),
                availableCopies
            };
        }));

        res.json(booksWithAvailability);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Error searching books', error: error.message });
    }
});

// Create a new book
router.post('/', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { title, author, isbn, copies = 1, ...otherFields } = req.body;
        const userId = req.user.id;

        console.log(`Received request to add book with copies: ${copies}`);

        if (copies < 1) {
            return res.status(400).json({ message: 'Copies must be at least 1.' });
        }

        let book = await Book.findOne({ isbn });
        if (!book) {
            book = new Book({
                title,
                author,
                isbn,
                copies: 0, // Initialize to 0 and update after adding copies
                ...otherFields
            });
            await book.save();
            console.log(`New book created with ID: ${book._id} and initial copies: ${book.copies}`);
        }

        const currentCopies = await BookCopy.countDocuments({ book: book._id });
        console.log(`Current copies in the database: ${currentCopies}`);

        if (copies > currentCopies) {
            for (let i = currentCopies; i < copies; i++) {
                const newCopy = new BookCopy({
                    book: book._id,
                    user: userId,
                    status: 'available',
                    copyNumber: i + 1
                });
                await newCopy.save();
                console.log(`New BookCopy created with ID: ${newCopy._id}`);
            }
        }

        book.copies = copies;
        await book.save();
        console.log(`Updated book copies to ${book.copies}`);

        res.status(201).json(book);
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(400).json({ message: error.message, stack: error.stack });
    }
});

// manually add a book to user's collection
router.post('/add', authenticateToken, roleAuth(['teacher']), async (req, res) => {
    try {
        const { title, author, publishedDate, pages, genre, subject, coverImage, isbn, copies } = req.body;
        const userId = req.user.id;

        let book = await Book.findOne({ title, author });

        if (book) {
            const newCopiesCount = book.copies + copies;
            for (let i = book.copies + 1; i <= newCopiesCount; i++) {
                const newCopy = new BookCopy({
                    book: book._id,
                    copyNumber: i,
                });
                await newCopy.save();
            }
            book.copies = newCopiesCount;
            book.availableCopies += copies;
            await book.save();
        } else {
            book = new Book({
                title,
                author,
                publishedDate,
                pages,
                genre,
                subject,
                coverImage,
                isbn,
                copies,
                availableCopies: copies,
            });

            await book.save();

            for (let i = 1; i <= copies; i++) {
                const newCopy = new BookCopy({
                    book: book._id,
                    copyNumber: i,
                });
                await newCopy.save();
            }
        }

        const user = await User.findById(userId);
        user.books.push(book);
        await user.save();

        res.status(201).json(book);
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(400).json({ error: err.message });
    }
});

// Add more copies of a book owned by the user
router.post('/add-copies', authenticateToken, roleAuth('teacher'), async (req, res) => {
    console.log('Entering add-copies route');
    const { bookId, numberOfCopies } = req.body;
    console.log(`Request to add ${numberOfCopies} copies to book ${bookId}`);
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.books.includes(bookId)) {
            console.log(`Book ${bookId} not found in user's library`);
            return res.status(403).json({ message: 'You can only add copies to books in your library' });
        }

        const result = await addBookCopies(bookId, numberOfCopies, userId);
        console.log(`Successfully added ${numberOfCopies} copies`);
        res.status(200).json(result.book);
    } catch (error) {
        console.error('Error adding book copies:', error);
        res.status(400).json({ message: error.message });
    }
});

const addBookCopies = async (bookId, numberOfCopies, userId) => {
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        const currentCopies = await BookCopy.countDocuments({ book: bookId, user: userId });
        console.log(`Current copies for book ${bookId}: ${currentCopies}`);

        const newCopies = [];
        for (let i = 0; i < numberOfCopies; i++) {
            const newCopy = new BookCopy({
                book: bookId,
                user: userId,
                status: 'available',
                copyNumber: currentCopies + i + 1
            });
            await newCopy.save();
            newCopies.push(newCopy);
            console.log(`Added new copy with ID: ${newCopy._id}`);
        }

        book.copies = currentCopies + numberOfCopies;
        await book.save();

        console.log(`Updated book copies to ${book.copies}`);

        return { book: await Book.findById(bookId).lean(), newCopies };
    } catch (error) {
        console.error('Error in addBookCopies:', error);
        throw error;
    }
};

// Get all books for the authenticated user
router.get('/user-books', authenticateToken, async (req, res) => {
    console.log('Entering /user-books route');
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('books');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const bookIds = user.books.map(book => book._id);

        const bookCopies = await BookCopy.find({ book: { $in: bookIds }, user: userId });

        const bookCopyCounts = bookCopies.reduce((acc, copy) => {
            acc[copy.book.toString()] = (acc[copy.book.toString()] || 0) + 1;
            return acc;
        }, {});
        console.log('Book copy counts:', JSON.stringify(bookCopyCounts, null, 2));

        const updatedBooks = await Promise.all(user.books.map(async (book) => {
            const bookObject = book.toObject();
            bookObject.copies = bookCopyCounts[book._id.toString()] || 0;
            console.log(`Book "${bookObject.title}" (ID: ${bookObject._id}) has ${bookObject.copies} copies`);
            return bookObject;
        }));

        res.status(200).json(updatedBooks);
    } catch (error) {
        console.error('Error in /user-books route:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Get a book by id
router.get('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send();
        }
        res.status(200).send(book);
    } catch (error) {
        res.status(500).send(error);
    }
});

// PATCH /:id - Update a book by ID
router.patch('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { copies } = req.body;
        const userId = req.user.id;

        if (copies < 1) {
            return res.status(400).send({ error: 'Copies must be 1 or more.' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).send('Book not found');
        }

        const currentCopies = await BookCopy.countDocuments({ book: id, user: userId });
        console.log(`Current copies: ${currentCopies}, Requested copies: ${copies}`);

        if (copies > currentCopies) {
            // Add new copies
            for (let i = currentCopies; i < copies; i++) {
                const newCopy = new BookCopy({
                    book: id,
                    user: userId,  // Add this line
                    status: 'available',
                    copyNumber: i + 1
                });
                await newCopy.save();
                console.log(`Added new copy with ID: ${newCopy._id}`);
            }
        } else if (copies < currentCopies) {
            // Remove excess copies
            const copiesToRemove = currentCopies - copies;
            const removedCopies = await BookCopy.find({ book: id, user: userId }).sort({ copyNumber: -1 }).limit(copiesToRemove);
            for (let copy of removedCopies) {
                await BookCopy.deleteOne({ _id: copy._id });
                console.log(`Removed copy with ID: ${copy._id}`);
            }
        }

        book.copies = copies;
        await book.save();
        res.send(book);
    } catch (error) {
        console.error('Error updating book copies:', error);
        res.status(400).send({ error: error.message });
    }
});

// Delete a book by id
router.delete('/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const userId = req.user.id;
        const bookId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the book is in the user's library
        if (!user.books.includes(bookId)) {
            return res.status(404).send('Book not found in your library');
        }

        // Remove the book from the user's library
        user.books = user.books.filter(id => id.toString() !== bookId);
        await user.save();

        // Delete BookCopy documents associated with this book and user
        const deletedCopies = await BookCopy.deleteMany({ book: bookId, user: userId });

        res.status(200).send({ message: 'Book removed from your library successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).send(error.message);
    }
});

// Get book history
router.get('/:id/history', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const bookCopies = await BookCopy.find({ book: req.params.id });
        const checkoutRecords = await CheckoutRecord.find({
            bookCopy: { $in: bookCopies.map(copy => copy._id) }
        }).populate('student', 'firstName lastName');

        res.json(checkoutRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//get checkout status
router.get('/:id/copies', async (req, res) => {
    try {
        const bookCopies = await BookCopy.find({ book: req.params.id });
        res.json(bookCopies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current status of all copies of a book
router.get('/:id/status', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const bookCopies = await BookCopy.find({ book: req.params.id });
        res.json(bookCopies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const reconcileBookAvailability = async (bookId) => {
    const book = await Book.findById(bookId);
    const activeCheckouts = await CheckoutRecord.countDocuments({
        'bookCopy.book': bookId,
        status: 'checked out'
    });

    book.availableCopies = book.copies - activeCheckouts;
    await book.save();

    console.log(`Reconciled book ${book.title}: Total copies: ${book.copies}, Available: ${book.availableCopies}`);
    return book;
};

// Add a new route to reconcile a specific book
router.post('/reconcile/:id', authenticateToken, roleAuth('teacher'), async (req, res) => {
    try {
        const book = await reconcileBookAvailability(req.params.id);
        res.json({ message: 'Book availability reconciled', book });
    } catch (error) {
        console.error('Error reconciling book availability:', error);
        res.status(500).json({ message: 'Error reconciling book availability', error: error.message });
    }
});

router.post('/reconcile', async (req, res) => {
    try {
        // Log current state
        console.log('Before reconciliation:');
        console.log('Total books:', await Book.countDocuments());
        console.log('Total book copies:', await BookCopy.countDocuments());
        console.log('Total checkout records:', await CheckoutRecord.countDocuments());

        // Find all BookCopy documents that reference non-existent books
        const books = await Book.find().select('_id');
        const orphanedCopies = await BookCopy.find({ book: { $nin: books.map(b => b._id) } });
        console.log('Orphaned book copies:', orphanedCopies.length);

        // Delete these orphaned BookCopy documents
        const deletedCopiesResult = await BookCopy.deleteMany({ _id: { $in: orphanedCopies.map(copy => copy._id) } });

        // Find and delete all CheckoutRecord documents that reference non-existent BookCopy documents
        const bookCopies = await BookCopy.find().select('_id');
        const orphanedCheckouts = await CheckoutRecord.find({ bookCopy: { $nin: bookCopies.map(bc => bc._id) } });
        console.log('Orphaned checkouts:', orphanedCheckouts.length);

        const deletedCheckoutsResult = await CheckoutRecord.deleteMany({ _id: { $in: orphanedCheckouts.map(checkout => checkout._id) } });

        // Update the checked out count
        const checkedOutCount = await CheckoutRecord.countDocuments({ status: 'checked out' });

        // Log final state
        console.log('After reconciliation:');
        console.log('Total books:', await Book.countDocuments());
        console.log('Total book copies:', await BookCopy.countDocuments());
        console.log('Total checkout records:', await CheckoutRecord.countDocuments());
        console.log('Checked out books:', checkedOutCount);

        res.json({
            message: 'Reconciliation complete',
            deletedCopies: deletedCopiesResult.deletedCount,
            deletedCheckouts: deletedCheckoutsResult.deletedCount,
            currentCheckedOutCount: checkedOutCount,
            totalBooks: await Book.countDocuments(),
            totalBookCopies: await BookCopy.countDocuments(),
            totalCheckoutRecords: await CheckoutRecord.countDocuments()
        });
    } catch (error) {
        console.error('Reconciliation error:', error);
        res.status(500).json({ message: 'An error occurred during reconciliation', error: error.message });
    }
});

module.exports = router;
