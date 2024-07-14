import React, { useState } from 'react';
import ClassEditSlideout from '../slideout/ClassEditSlideout';

const ClassTable = ({ classes, setClasses, handleEditClass, handleDeleteClass }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const handleEditClick = (classItem) => {
        setSelectedClass(classItem);
        setIsSlideoutOpen(true);
    };

    const handleSortChange = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const sortedClasses = [...classes].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const gradeName = (grade) => {
        const gradeMap = {
            'K': 'Kindergarten',
            '1': '1st Grade',
            '2': '2nd Grade',
            '3': '3rd Grade',
            '4': '4th Grade',
            '5': '5th Grade',
            '6': '6th Grade',
            '7': '7th Grade',
            '8': '8th Grade',
            '9': '9th Grade',
            '10': '10th Grade',
            '11': '11th Grade',
            '12': '12th Grade',
            'O': 'Other',
        };
        if (!gradeMap[grade]) {
            console.warn(`Unexpected grade value: ${grade}`);
            return 'Undefined Grade';
        }
        return gradeMap[grade];
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                        Class Name
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Grade
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Students
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {sortedClasses.map((classItem) => (
                                    <tr key={classItem._id}>
                                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                            <div className="flex items-center">
                                                <div className="font-medium text-gray-900">{classItem.name}</div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                            {gradeName(classItem.grade)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                            {classItem.studentCount || 0}
                                        </td>
                                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                            <button
                                                onClick={() => handleEditClick(classItem)}
                                                className="text-teal-600 hover:text-teal-900"
                                            >
                                                Edit<span className="sr-only">, {classItem.name}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedClass && (
                <ClassEditSlideout
                    isOpen={isSlideoutOpen}
                    onClose={() => setIsSlideoutOpen(false)}
                    classItem={selectedClass}
                    onSave={handleEditClass}
                    onDelete={handleDeleteClass}
                />
            )}
        </div>
    );
};

export default ClassTable;
