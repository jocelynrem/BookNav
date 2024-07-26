// StudentRow.js
import React from 'react';

const StudentRow = ({ student, selectedStudents, onSelectStudent, onStudentClick, onEditStudent }) => {
    const isSelected = selectedStudents.includes(student._id);

    return (
        <tr key={student._id}>
            <td className="relative py-5 pl-4 pr-3 sm:pl-6 sm:pr-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-pink-600 shadow-sm focus:ring-pink-500"
                        checked={isSelected}
                        onChange={() => onSelectStudent(student._id)}
                    />
                </div>
            </td>
            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                <div className="flex items-center">
                    <div className="ml-4">
                        <div
                            className="font-medium text-teal-900 cursor-pointer hover:text-teal-700"
                            onClick={() => onStudentClick(student)}
                        >
                            {student.firstName} {student.lastName}
                        </div>
                    </div>
                </div>
            </td>
            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                {student.grade}
            </td>
            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                {student.class ? student.class.name : 'N/A'}
            </td>
            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                <button
                    onClick={() => onEditStudent(student)}
                    className="text-teal-900 hover:text-teal-800"
                >
                    Edit<span className="sr-only">, {student.firstName} {student.lastName}</span>
                </button>
            </td>
        </tr>
    );
};

export default StudentRow;
