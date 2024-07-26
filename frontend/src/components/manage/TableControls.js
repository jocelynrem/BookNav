import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const TableControls = ({
    searchQuery,
    onSearchChange,
    onSortChange,
    sortField,
    selectedClassForView,
    classes,
    onClassChange
}) => (
    <div className="sm:flex sm:items-center sm:justify-between">
        {classes.length > 1 && (
            <div className="sm:flex-auto">
                <h2 className="text-base font-semibold leading-6 text-gray-900">
                    View Students in
                    <select
                        value={selectedClassForView ? selectedClassForView._id : 'all'}
                        onChange={(e) => {
                            const value = e.target.value;
                            const selectedClass = value === 'all'
                                ? { _id: 'all', name: 'All Classes' }
                                : classes.find(cls => cls._id === value);
                            onClassChange(selectedClass);
                        }}
                        className="ml-2 rounded-md border-gray-300 text-base leading-6 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    >
                        <option value="all">All Classes</option>
                        {classes.map(cls => (
                            <option key={cls._id} value={cls._id}>{cls.name}</option>
                        ))}
                    </select>
                </h2>
            </div>
        )}
        <div className="mt-4 sm:mt-0 sm:flex-none flex items-center space-x-4">
            <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    name="search"
                    id="search"
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                    placeholder="Search students"
                    value={searchQuery}
                    onChange={onSearchChange}
                />
            </div>
        </div>
    </div>
);

export default TableControls;
