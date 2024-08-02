import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MinusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import StudentForm from './StudentForm';
import StudentDetails from '../slideout/StudentDetails';
import { deleteStudent } from '../../services/studentService';
import SlideoutParent from '../slideout/SlideoutParent';
import Swal from 'sweetalert2';
import CSVImport from './CSVImport';
import Pagination from './Pagination';

const StudentsPanel = ({ students, selectedClass, refreshStudents, classes, setStudents, setClasses }) => {
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isImportingCSV, setIsImportingCSV] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleAddStudent = async (studentData) => {
        setIsAddingStudent(prev => !prev);
        setEditingStudentId(null);

        if (studentData) {
            try {
                const newStudent = await createStudent(studentData);
                setStudents(prevStudents => [...prevStudents, newStudent]);

                // Update the class data
                setClasses(prevClasses => prevClasses.map(cls =>
                    cls._id === studentData.classId
                        ? { ...cls, studentCount: (cls.studentCount || 0) + 1 }
                        : cls
                ));

                Swal.fire('Success', 'Student added successfully', 'success');
            } catch (error) {
                console.error('Failed to add student:', error);
                Swal.fire('Error', 'Failed to add student. Please try again.', 'error');
            }
        }
    };

    const handleToggleEditStudent = (studentId) => {
        setEditingStudentId(prev => prev === studentId ? null : studentId);
        setIsAddingStudent(false);
    };

    const handleDeleteStudent = async (studentId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You are about to delete this student. All of the student's data will be erased. This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteStudent(studentId);

                // Update students state
                setStudents(prevStudents => prevStudents.filter(student => student._id !== studentId));

                // Update class student count
                const deletedStudent = students.find(student => student._id === studentId);
                if (deletedStudent) {
                    setClasses(prevClasses => prevClasses.map(cls =>
                        cls._id === deletedStudent.class
                            ? { ...cls, studentCount: Math.max((cls.studentCount || 0) - 1, 0) }
                            : cls
                    ));
                }

                Swal.fire('Deleted!', 'The student has been deleted.', 'success');
            } catch (error) {
                console.error('Failed to delete student:', error);
                Swal.fire('Error', 'Failed to delete student. Please try again.', 'error');
            }
        }
    };

    const handleStudentFormClose = () => {
        setIsAddingStudent(false);
        setEditingStudentId(null);
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedStudent(null);
    };

    const handleImportCSV = () => {
        setIsImportingCSV(true);
    };

    const handleImportComplete = (importedCount) => {
        setIsImportingCSV(false);

        // Update students state
        refreshStudents();

        // Update class student count
        if (selectedClass) {
            setClasses(prevClasses => prevClasses.map(cls =>
                cls._id === selectedClass._id
                    ? { ...cls, studentCount: (cls.studentCount || 0) + importedCount }
                    : cls
            ));
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const indexOfLastStudent = currentPage * itemsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
    const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

    return (
        <div className="w-full md:w-2/3 p-4">
            <h2 className="text-xl font-bold mb-4">Students</h2>
            {selectedClass ? (
                <>
                    <div className="flex flex-col md:flex-row md:space-x-2 mb-4 space-y-2 md:space-y-0">
                        <button
                            onClick={handleAddStudent}
                            className="flex items-center justify-center w-full md:w-1/2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-700 hover:bg-pink-800"
                        >
                            {isAddingStudent ? (
                                <MinusIcon className="h-5 w-5 mr-2" />
                            ) : (
                                <PlusIcon className="h-5 w-5 mr-2" />
                            )}
                            {isAddingStudent ? 'Cancel' : 'Add Student'}
                        </button>
                        <button
                            onClick={handleImportCSV}
                            className="flex items-center justify-center w-full md:w-1/2 px-4 py-2 border border-pink-700 rounded-md shadow-sm text-sm font-medium text-pink-700 bg-white hover:bg-pink-50"
                        >
                            <DocumentTextIcon className="h-5 w-5 mr-2" />
                            Import Students by CSV
                        </button>
                    </div>
                    {isAddingStudent && (
                        <div className="mb-4">
                            <StudentForm
                                classId={selectedClass._id}
                                onSave={() => {
                                    refreshStudents();
                                    handleStudentFormClose();
                                }}
                                onClose={handleStudentFormClose}
                            />
                        </div>
                    )}
                    {students.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500">No students in this class yet. Add students to get started.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    {currentStudents.map((student) => (
                                        <React.Fragment key={student._id}>
                                            <li
                                                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <button
                                                        className="text-left focus:outline-none"
                                                        onClick={() => handleStudentClick(student)}
                                                    >
                                                        <p className="text-sm font-medium text-pink-700 truncate">{student.firstName} {student.lastName}</p>
                                                        <p className="mt-1 text-xs text-gray-500">Grade: {student.grade}</p>
                                                    </button>
                                                </div>
                                                <div className="flex items-center ml-4 space-x-2">
                                                    <button
                                                        onClick={() => handleToggleEditStudent(student._id)}
                                                        className={`text-teal-700 hover:text-teal-800 ${editingStudentId === student._id ? 'bg-teal-100 p-1 rounded' : ''}`}
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStudent(student._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </li>
                                            {editingStudentId === student._id && (
                                                <li className="px-6 py-4 bg-gray-50">
                                                    <StudentForm
                                                        studentData={student}
                                                        classId={selectedClass._id}
                                                        onSave={() => {
                                                            refreshStudents();
                                                            handleStudentFormClose();
                                                        }}
                                                        onClose={handleStudentFormClose}
                                                    />
                                                </li>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </ul>
                            </div>
                            {students.length > itemsPerPage && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={students.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </>
            ) : (
                <div className="text-center py-4">
                    <p className="text-gray-500">Select a class to view or add students.</p>
                </div>
            )}
            <SlideoutParent
                isOpen={isDetailsOpen}
                onClose={handleCloseDetails}
                title="Student Details"
            >
                {selectedStudent && (
                    <StudentDetails
                        student={selectedStudent}
                        onEdit={() => handleToggleEditStudent(selectedStudent._id)}
                        classes={classes}
                        onClose={handleCloseDetails}
                    />
                )}
            </SlideoutParent>
            {isImportingCSV && (
                <CSVImport
                    onImportComplete={handleImportComplete}
                    onClose={() => setIsImportingCSV(false)}
                    selectedClass={selectedClass}
                />
            )}
        </div>
    );
};

export default StudentsPanel;