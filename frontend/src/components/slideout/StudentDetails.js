import React, { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const StudentDetails = ({ student, onEdit, classes = [] }) => {
    const [currentStudent, setCurrentStudent] = useState(student);

    useEffect(() => {
        setCurrentStudent(student);
    }, [student]);

    const getClassName = (classData) => {
        if (!classData) return 'N/A';
        if (typeof classData === 'string') {
            if (classes.length === 0) return `Class ID: ${classData}`;
            const fullClass = classes.find(cls => cls._id === classData);
            return fullClass ? fullClass.name : `Class ID: ${classData}`;
        }
        return classData.name || `Class ID: ${classData._id}`;
    };

    return (
        <div className="space-y-6 pb-16">
            <div className="flex justify-between items-center">
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
                <h3 className="font-medium text-gray-900">{currentStudent.firstName} {currentStudent.lastName}</h3>
                <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">First Name</dt>
                        <dd className="text-gray-900">{currentStudent.firstName || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Last Name</dt>
                        <dd className="text-gray-900">{currentStudent.lastName || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Grade</dt>
                        <dd className="text-gray-900">{currentStudent.grade || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Class</dt>
                        <dd className="text-gray-900">{getClassName(currentStudent.class)}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Reading Level</dt>
                        <dd className="text-gray-900">{currentStudent.readingLevel || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">PIN</dt>
                        <dd className="text-gray-900">{currentStudent.pin || 'N/A'}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default StudentDetails;
