import React from 'react';

const SlideoutDetails = ({ book }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="space-y-6 pb-16">
            <div>
                <div className="aspect-h-3 aspect-w-3 block w-full max-w-xs mx-auto overflow-hidden rounded-lg">
                    <img
                        src={book.coverImage}
                        alt={book.title}
                        className="object-cover w-full"
                    />
                </div>
                <div className="mt-4">
                    <h2 className="text-base font-semibold leading-6 text-gray-900">
                        {book.title}
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        {book.author}
                    </p>
                </div>
            </div>
            <div>
                <h3 className="font-medium text-gray-900">Information</h3>
                <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Genre</dt>
                        <dd className="text-gray-900">{book.genre}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Subject</dt>
                        <dd className="text-gray-900">{book.subject}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Published Date</dt>
                        <dd className="text-gray-900">{formatDate(book.publishedDate)}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Pages</dt>
                        <dd className="text-gray-900">{book.pages}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Copies</dt>
                        <dd className="text-gray-900">{book.copies}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">ISBN</dt>
                        <dd className="text-gray-900">{book.isbn}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default SlideoutDetails;
