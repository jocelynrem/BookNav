// StudentTableHeader.js
import React from 'react';
import StudentSortHeader from './StudentSortHeader';

const StudentTableHeader = ({ sortField, sortOrder, onSortChange, selectedStudents, onSelectAllStudents, currentStudents }) => (
    <thead>
        <tr>
            <th scope="col" className="relative py-3.5 pl-4 pr-3 sm:pl-6 sm:pr-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-pink-600 shadow-sm focus:ring-pink-500"
                        checked={selectedStudents.length === currentStudents.length}
                        onChange={onSelectAllStudents}
                    />
                </div>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <StudentSortHeader
                    field="name"
                    handleSortChange={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    label="Name"
                />
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <StudentSortHeader
                    field="grade"
                    handleSortChange={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    label="Grade"
                />
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <StudentSortHeader
                    field="class"
                    handleSortChange={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    label="Class"
                />
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pl-6 sm:pr-6">
                <span className="sr-only">Edit</span>
            </th>
        </tr>
    </thead>
);

export default StudentTableHeader;
