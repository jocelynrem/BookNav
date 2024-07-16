import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const StudentDetails = ({ student, onEdit, onClose }) => {
    const renderField = (label, value) => (
        <div className="flex justify-between py-3 text-sm font-medium">
            <dt className="text-gray-500">{label}</dt>
            <dd className="text-gray-900">{value || 'N/A'}</dd>
        </div>
    );

    return (
        <div className="space-y-6 pb-16">
            <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold leading-6 text-gray-900">
                    {student.firstName} {student.lastName}
                </h2>
                <button
                    type="button"
                    className="flex items-center text-teal-700 hover:text-teal-900"
                    onClick={onEdit}
                >
                    Edit student
                    <ArrowRightIcon className="ml-1 h-5 w-5" />
                </button>
            </div>
            <div>
                <h3 className="font-medium text-gray-900">Student Information</h3>
                <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                    {renderField("First Name", student.firstName)}
                    {renderField("Last Name", student.lastName)}
                    {renderField("Grade", student.grade)}
                    {renderField("Class", student.class ? student.class.name : 'N/A')}
                    {renderField("Reading Level", student.readingLevel)}
                    {renderField("PIN", student.pin)}
                    {renderField("Created At", new Date(student.createdAt).toLocaleString())}
                    {renderField("Updated At", new Date(student.updatedAt).toLocaleString())}
                </dl>
            </div>
        </div>
    );
};

export default StudentDetails;