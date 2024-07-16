import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';
import Swal from 'sweetalert2';
import { createStudent, getStudentsByClass } from '../../services/studentService';
import StudentTable from './StudentTable';
import CSVImport from './CSVImport';

const StudentManagement = ({ students, setStudents, classes }) => {
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showCSVImport, setShowCSVImport] = useState(false);
    const [newStudentFirstName, setNewStudentFirstName] = useState('');
    const [newStudentLastName, setNewStudentLastName] = useState('');
    const [newStudentPin, setNewStudentPin] = useState('');
    const [newStudentReadingLevel, setNewStudentReadingLevel] = useState('');
    const [selectedClassForAdd, setSelectedClassForAdd] = useState(null);

    useEffect(() => {
        if (classes.length > 0 && !selectedClassForAdd) {
            setSelectedClassForAdd(classes[0]);
        }
    }, [classes, selectedClassForAdd]);

    const fetchStudents = async (classId) => {
        try {
            const students = await getStudentsByClass(classId);
            setStudents(students);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const showNotification = (message, icon) => {
        Swal.fire({
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 3000,
            icon,
            title: message,
        });
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        if (!selectedClassForAdd) return;

        const duplicateStudent = students.find(student =>
            student.class === selectedClassForAdd._id &&
            student.firstName === newStudentFirstName &&
            student.lastName === newStudentLastName
        );

        if (duplicateStudent) {
            Swal.fire({
                icon: 'error',
                title: 'Duplicate Student',
                text: 'A student with this first and last name already exists in this class.',
            });
            return;
        }

        try {
            const newStudent = await createStudent({
                firstName: newStudentFirstName,
                lastName: newStudentLastName,
                pin: newStudentPin,
                classId: selectedClassForAdd._id,
                readingLevel: newStudentReadingLevel,
            });
            setStudents(prevStudents => [...prevStudents, newStudent]);
            setNewStudentFirstName('');
            setNewStudentLastName('');
            setNewStudentPin('');
            setNewStudentReadingLevel('');
            showNotification('Student has been created successfully.', 'success');
        } catch (error) {
            console.error('Failed to create student:', error.response ? error.response.data : error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to create student: ${error.response ? error.response.data.message : error.message}`,
            });
        }
    };

    const handleClassChangeForAdd = (e) => {
        const selectedClassId = e.target.value;
        const selectedClass = classes.find(cls => cls._id === selectedClassId);
        setSelectedClassForAdd(selectedClass);
    };

    const handleCSVImportComplete = () => {
        showNotification('CSV import completed successfully.', 'success');
        setShowCSVImport(false);
        fetchStudents(selectedClassForAdd._id); // Refresh the student list
    };

    return (
        <div className="mt-8">
            <div className="relative mt-8">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex items-center justify-between px-4">
                    <span className={`bg-white pr-3 text-base leading-6 ${!selectedClassForAdd ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}>
                        {!selectedClassForAdd ? "Select a class before adding students" : "Add Students"}
                    </span>
                    <button
                        type="button"
                        className={`inline-flex items-center gap-x-1.5 rounded-full px-4 py-2 text-base font-semibold shadow-sm ring-1 ring-inset ${!selectedClassForAdd ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'}`}
                        onClick={() => setShowAddStudent(!showAddStudent)}
                        disabled={!selectedClassForAdd}
                    >
                        <PlusIcon aria-hidden="true" className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400" />
                        {showAddStudent ? 'Hide' : 'Add Student'}
                    </button>
                </div>
            </div>

            {showAddStudent && selectedClassForAdd && (
                <div className="mt-8 bg-gray-50 shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Add a new student to
                            {Array.isArray(classes) && classes.length > 1 ? (
                                <select
                                    value={selectedClassForAdd._id}
                                    onChange={handleClassChangeForAdd}
                                    className="ml-2 rounded-md border-gray-300 text-base leading-6"
                                >
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <span> {selectedClassForAdd.name}</span>
                            )}
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Add a new student to the selected class.</p>
                        </div>
                        <form onSubmit={handleCreateStudent} className="mt-5 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="studentFirstName" className="sr-only">
                                    Student first name
                                </label>
                                <input
                                    type="text"
                                    name="studentFirstName"
                                    id="studentFirstName"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                    placeholder="Student first name"
                                    value={newStudentFirstName}
                                    onChange={(e) => setNewStudentFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="studentLastName" className="sr-only">
                                    Student last name
                                </label>
                                <input
                                    type="text"
                                    name="studentLastName"
                                    id="studentLastName"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                    placeholder="Student last name"
                                    value={newStudentLastName}
                                    onChange={(e) => setNewStudentLastName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="studentPin" className="sr-only">
                                    Student PIN
                                </label>
                                <input
                                    type="text"
                                    name="studentPin"
                                    id="studentPin"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                    placeholder="4-digit PIN"
                                    value={newStudentPin}
                                    onChange={(e) => setNewStudentPin(e.target.value)}
                                    required
                                    pattern="\d{4}"
                                    title="PIN should be a 4-digit number"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="studentReadingLevel" className="sr-only">
                                    Reading Level (optional)
                                </label>
                                <input
                                    type="text"
                                    name="studentReadingLevel"
                                    id="studentReadingLevel"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                    placeholder="Reading Level (optional)"
                                    value={newStudentReadingLevel}
                                    onChange={(e) => setNewStudentReadingLevel(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-md bg-pink-700 px-5 py-2 text-base font-semibold text-white shadow-sm hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
                            >
                                Add
                            </button>
                        </form>
                        <div className="mt-8 relative w-full">
                            <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-gray-50 px-2 text-gray-500">or</span>
                            </div>
                        </div>
                        <div className="mt-4 w-full flex justify-center sm:justify-center">
                            <button
                                type="button"
                                className="inline-flex w-full sm:w-auto items-center justify-center px-10 py-2 border border-teal-900 text-sm font-medium rounded-md text-teal-900 bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 whitespace-nowrap text-center"
                                onClick={() => setShowCSVImport(!showCSVImport)}
                            >
                                {showCSVImport ? 'Hide CSV Import' : 'Bulk Add with CSV'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCSVImport && selectedClassForAdd && (
                <CSVImport
                    onImportComplete={handleCSVImportComplete}
                    selectedClass={selectedClassForAdd}
                />
            )}

            <StudentTable
                students={students}
                setStudents={setStudents}
                classes={classes}
                selectedClassForAdd={selectedClassForAdd}
            />
        </div>
    );
};

export default StudentManagement;
