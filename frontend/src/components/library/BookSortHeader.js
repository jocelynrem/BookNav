import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

const BookSortHeader = ({ field, handleSortChange, getSortIcon, label }) => (
    <th
        scope="col"
        className={`cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 ${field === 'copies' ? 'hidden sm:table-cell' : ''}`}
    >
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                handleSortChange(field);
            }}
            className="group inline-flex items-center hover:text-teal-700 transition-colors duration-200"
        >
            {label}
            <span className={`ml-2 flex-none rounded ${getSortIcon(field) ? 'bg-gray-100 text-gray-900' : 'invisible text-gray-400 group-hover:visible group-focus:visible'}`}>
                {getSortIcon(field) === 'asc' ? (
                    <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                )}
            </span>
        </a>
    </th>
);

export default BookSortHeader;