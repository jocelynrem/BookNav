import React from 'react';

const BookEditModal = ({ editingBook, setEditingBook, handleUpdateBook }) => {
    if (!editingBook) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="text-xl font-semibold mb-4">Edit Book</h2>
                <input
                    type="text"
                    placeholder="Title"
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Author First Name"
                    value={editingBook.authorFirstName}
                    onChange={(e) => setEditingBook({ ...editingBook, authorFirstName: e.target.value })}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Author Last Name"
                    value={editingBook.authorLastName}
                    onChange={(e) => setEditingBook({ ...editingBook, authorLastName: e.target.value })}
                    className="border p-2 mb-2 w-full"
                />
                <button
                    onClick={() => handleUpdateBook(editingBook._id)}
                    className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-2"
                >
                    Save
                </button>
                <button
                    onClick={() => setEditingBook(null)}
                    className="block rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default BookEditModal;
