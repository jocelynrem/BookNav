import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

const BookSortHeader = ({ field, handleSortChange, getSortIcon, label }) => (
    <th
        scope="col"
        className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
        onClick={() => handleSortChange(field)}
    >
        <a href="#" className="group inline-flex">
            {label}
            <span className={`ml-2 flex-none rounded ${getSortIcon(field) ? 'bg-gray-100 text-gray-900' : 'invisible text-gray-400 group-hover:visible group-focus:visible'}`}>
                {getSortIcon(field) === 'asc' ? <ChevronUpIcon className="h-5 w-5 inline" /> : <ChevronDownIcon className="h-5 w-5 inline" />}
            </span>
        </a>
    </th>
);

export default BookSortHeader;
