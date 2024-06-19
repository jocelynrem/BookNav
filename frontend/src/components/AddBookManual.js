import React, { useState } from 'react';
import { createBook } from '../services/bookService';
import { PhotoIcon, BarcodeIcon } from '@heroicons/react/24/solid';

const AddBook = () => {
    const [bookData, setBookData] = useState({
        title: '',
        author: '',
        isbn: '',
        coverImage: '',
        publisher: '',
        publishedDate: '',
        pages: '',
        genre: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBook(bookData);
            setSuccess('Book added successfully!');
            setBookData({
                title: '',
                author: '',
                isbn: '',
                coverImage: '',
                publisher: '',
                publishedDate: '',
                pages: '',
                genre: '',
            });
        } catch (err) {
            setError('Failed to add book');
            console.error(err);
        }
    };

    const handleISBNLookup = async () => {
        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${bookData.isbn}&format=json&jscmd=data`);
            const data = await response.json();
            const bookInfo = data[`ISBN:${bookData.isbn}`];
            if (bookInfo) {
                setBookData({
                    title: bookInfo.title,
                    author: bookInfo.authors.map(author => author.name).join(', '),
                    coverImage: bookInfo.cover ? bookInfo.cover.large : '',
                    publisher: bookInfo.publishers[0].name,
                    publishedDate: bookInfo.publish_date,
                    pages: bookInfo.number_of_pages,
                    genre: bookInfo.subjects.map(subject => subject.name).join(', '),
                    isbn: bookData.isbn,
                });
            } else {
                alert('No book found with this ISBN');
            }
        } catch (err) {
            setError('Failed to fetch book information');
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12 px-4 sm:px-6 lg:px-8">
                <h2 className="text-base font-semibold leading-7 text-gray-900">Add New Book</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    Fill out the details of the book you want to add.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label htmlFor="isbn" className="block text-sm font-medium leading-6 text-gray-900">
                            ISBN
                        </label>
                        <div className="mt-2 flex">
                            <input
                                type="text"
                                name="isbn"
                                id="isbn"
                                value={bookData.isbn}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            <button
                                type="button"
                                onClick={handleISBNLookup}
                                className="ml-4 inline-flex items-center px-8 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                            >
                                Scan ISBN
                            </button>
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                            Title
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={bookData.title}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <div className="sm:grid sm:grid-cols-6 sm:gap-x-6">
                            <div className="sm:col-span-2">
                                <label htmlFor="authorFirstName" className="block text-sm font-medium leading-6 text-gray-900">
                                    Author First Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="authorFirstName"
                                        id="authorFirstName"
                                        value={bookData.authorFirstName}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="authorLastName" className="block text-sm font-medium leading-6 text-gray-900">
                                    Author Last Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="authorLastName"
                                        id="authorLastName"
                                        value={bookData.authorLastName}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="coverImage" className="block text-sm font-medium leading-6 text-gray-900">
                            Cover Image URL
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="coverImage"
                                id="coverImage"
                                value={bookData.coverImage}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="publisher" className="block text-sm font-medium leading-6 text-gray-900">
                            Publisher
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="publisher"
                                id="publisher"
                                value={bookData.publisher}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="publishedDate" className="block text-sm font-medium leading-6 text-gray-900">
                            Published Date
                        </label>
                        <div className="mt-2">
                            <input
                                type="date"
                                name="publishedDate"
                                id="publishedDate"
                                value={bookData.publishedDate}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="pages" className="block text-sm font-medium leading-6 text-gray-900">
                            Pages
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="pages"
                                id="pages"
                                value={bookData.pages}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="genre" className="block text-sm font-medium leading-6 text-gray-900">
                            Genre
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="genre"
                                id="genre"
                                value={bookData.genre}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6 pb-6">
                <button
                    type="button"
                    onClick={() => setBookData({
                        title: '',
                        authorFirstName: '',
                        authorLastName: '',
                        isbn: '',
                        coverImage: '',
                        publisher: '',
                        publishedDate: '',
                        pages: '',
                        genre: '',
                    })}
                    className="text-sm font-semibold leading-6 text-gray-900"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Save
                </button>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
        </form>
    );
};

export default AddBook;
