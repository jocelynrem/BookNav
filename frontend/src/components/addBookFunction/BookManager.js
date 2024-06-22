import React, { useState } from 'react';
import { addBookToLibrary } from '../../services/bookService';
import Notification from './Notification';
import ConfirmationDialog from './ConfirmationDialog';

const BookManager = () => {
    const [notification, setNotification] = useState({ show: false, message: '', error: false });
    const [dialog, setDialog] = useState({ open: false, title: '', content: '', onConfirm: () => { } });

    const handleAddBook = async (book, copies) => {
        await addBookToLibrary(book, copies, setNotification, setDialog);
    };

    return (
        <div>
            {/* Your form or button to trigger adding book */}
            <button onClick={() => handleAddBook(someBook, someCopies)}>Add Book</button>

            {/* Notification and Dialog components */}
            <Notification notification={notification} setNotification={setNotification} />
            <ConfirmationDialog dialog={dialog} setDialog={setDialog} />
        </div>
    );
};

export default BookManager;
