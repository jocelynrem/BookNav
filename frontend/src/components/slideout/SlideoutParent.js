//frontend/src/components/slideout/SlideoutParent.js

import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SlideoutDetails from './SlideoutDetails';
import SlideoutEdit from './SlideoutEdit';
import { getUserBooks, deleteBook } from '../../services/bookService';
import Notification from '../addBookFunction/Notification';
import ConfirmationDialog from '../addBookFunction/ConfirmationDialog';

const SlideoutParent = ({ isOpen, onClose, book, onSave, fetchBooks, isEditing: initialIsEditing, setUserBooks }) => {
    const [bookExists, setBookExists] = useState(false);
    const [isEditing, setIsEditing] = useState(initialIsEditing);
    const [notification, setNotification] = useState({ show: false, message: '', error: false, undo: false });
    const [dialog, setDialog] = useState({ open: false, title: '', content: '', onConfirm: () => { } });
    const [undoBook, setUndoBook] = useState(null);

    useEffect(() => {
        const checkBookInLibrary = async () => {
            if (isOpen && book) {
                const existingBooks = await getUserBooks();
                const existingBook = existingBooks.find(b =>
                    b.title?.toLowerCase() === book.title?.toLowerCase() &&
                    b.authorFirstName?.toLowerCase() === book.authorFirstName?.toLowerCase() &&
                    b.authorLastName?.toLowerCase() === book.authorLastName?.toLowerCase()
                );
                setBookExists(!!existingBook);
            }
        };
        checkBookInLibrary();
    }, [isOpen, book]);

    useEffect(() => {
        setIsEditing(initialIsEditing);
    }, [initialIsEditing]);

    const handleUndo = async () => {
        if (undoBook) {
            await deleteBook(undoBook._id);
            setUserBooks(prevBooks => prevBooks.filter(book => book._id !== undoBook._id));
            setNotification({ show: false, message: '' });
            setUndoBook(null);
        }
    };

    return (
        <>
            <Transition.Root show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-40" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                            <div className="px-4 py-6 sm:px-6">
                                                <div className="flex items-start justify-between">
                                                    <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                                                        {isEditing ? 'Edit Book Details' : 'Book Details'}
                                                    </Dialog.Title>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-700"
                                                            onClick={onClose}
                                                        >
                                                            <span className="absolute -inset-2.5" />
                                                            <span className="sr-only">Close panel</span>
                                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative flex-1 py-6 px-4 sm:px-6">
                                                {isEditing ? (
                                                    <SlideoutEdit
                                                        book={book}
                                                        onSave={onSave}
                                                        onClose={onClose}
                                                        fetchBooks={fetchBooks}
                                                        onView={() => setIsEditing(false)}
                                                    />
                                                ) : (
                                                    <SlideoutDetails
                                                        book={book}
                                                        bookExists={bookExists}
                                                        onEdit={() => setIsEditing(true)}
                                                        onClose={onClose}
                                                        setNotification={setNotification}
                                                        setDialog={setDialog}
                                                        setUndoBook={setUndoBook}
                                                        setUserBooks={setUserBooks}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
            <Notification notification={notification} setNotification={setNotification} onUndo={handleUndo} />
            <ConfirmationDialog dialog={dialog} setDialog={setDialog} />
        </>
    );
};

export default SlideoutParent;
