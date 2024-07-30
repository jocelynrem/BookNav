import React, { useState, useEffect } from 'react';
import { getStudents } from '../../services/studentService';
import StudentPinAuth from './StudentPinAuth';
import StudentDashboard from '../../pages/StudentDashboard';
import StudentHeader from './StudentHeader';

const StudentCheckout = ({ onExit }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showPinAuth, setShowPinAuth] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const fetchedStudents = await getStudents();
                setStudents(fetchedStudents);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, []);

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setShowPinAuth(true);
    };

    const handlePinSuccess = () => {
        setShowPinAuth(false);
        setShowDashboard(true);
    };

    const handleLogout = () => {
        setSelectedStudent(null);
        setShowDashboard(false);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <StudentHeader onExit={onExit} />
            <div className="max-w-7xl mx-auto px-4 sm:px-1 lg:px-8 py-8">
                {showDashboard ? (
                    <StudentDashboard student={selectedStudent} onLogout={handleLogout} />
                ) : showPinAuth ? (
                    <div className="mt-8">
                        <StudentPinAuth student={selectedStudent} onSuccess={handlePinSuccess} onCancel={() => setShowPinAuth(false)} />
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Select a Student</h2>
                        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {students.map((student) => (
                                <li
                                    key={student._id}
                                    className="col-span-1 flex rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleStudentSelect(student)}
                                >
                                    <div className="flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md bg-teal-600">
                                        {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                        <div className="flex-1 px-4 py-2 text-sm truncate">
                                            <p className="text-gray-900 font-medium hover:text-gray-600">
                                                {student.firstName} {student.lastName}
                                            </p>
                                            <p className="text-gray-500">{student.grade}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCheckout;
