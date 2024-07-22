import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

const StudentSortHeader = ({ field, handleSortChange, sortField, sortOrder, label }) => (
    <div onClick={() => handleSortChange(field)} className="group inline-flex cursor-pointer">
        {label}
        <span className={`ml-2 flex-none rounded ${sortField === field ? 'bg-gray-100 text-gray-900' : 'invisible text-gray-400 group-hover:visible group-focus:visible'}`}>
            {sortField === field ? (
                sortOrder === 'asc' ? (
                    <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                )
            ) : (
                <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
            )}
        </span>
    </div>
);

export default StudentSortHeader;
