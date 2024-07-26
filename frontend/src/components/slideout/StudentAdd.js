import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import Swal from 'sweetalert2';
import { createStudent } from '../../services/studentService';

const StudentAdd = ({ onImportComplete, selectedClass, classes, students, setStudents }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [error, setError] = useState(null);
    const [newStudentFirstName, setNewStudentFirstName] = useState('');
    const [newStudentLastName, setNewStudentLastName] = useState('');
    const [newStudentPin, setNewStudentPin] = useState('');
    const [newStudentReadingLevel, setNewStudentReadingLevel] = useState('');
    const [selectedClassForAdd, setSelectedClassForAdd] = useState(null);

    useEffect(() => {
        if (selectedClass && selectedClass._id !== 'all') {
            setSelectedClassForAdd(selectedClass);
        } else {
            setSelectedClassForAdd(null);
        }
    }, [selectedClass]);

    useEffect(() => {
        setSelectedClassForAdd(null);
    }, []); // Reset dropdown on component mount

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setFile(file);
        setError(null);

        Papa.parse(file, {
            preview: 5,
            complete: (results) => {
                setPreview(results.data);
            },
            error: (error) => {
                setError(`Error parsing CSV: ${error.message}`);
            }
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        multiple: false
    });

    const handleImport = async () => {
        if (!file) {
            setError('Please select a CSV file first.');
            return;
        }

        setImporting(true);
        setError(null);
        const results = { success: 0, failed: 0, errors: [] };

        Papa.parse(file, {
            complete: async (result) => {
                const headers = result.data[0].map(header => header.toLowerCase().trim());
                const studentsData = result.data.slice(1);

                for (let studentData of studentsData) {
                    const student = {};
                    headers.forEach((header, index) => {
                        student[header] = studentData[index];
                    });

                    if (!student.firstname || !student.lastname) {
                        results.failed++;
                        results.errors.push(`Missing required fields for student: ${JSON.stringify(student)}`);
                        continue;
                    }

                    try {
                        await createStudent({
                            firstName: student.firstname,
                            lastName: student.lastname,
                            pin: student.pin || '0000', // Default PIN if not provided
                            readingLevel: student.readinglevel || '',
                            classId: selectedClassForAdd._id
                        });
                        results.success++;
                    } catch (error) {
                        results.failed++;
                        results.errors.push(`Failed to import ${student.firstname} ${student.lastname}: ${error.message}`);
                    }
                }

                setImportResults(results);
                setImporting(false);
                onImportComplete();
            },
            error: (error) => {
                setError(`Error parsing CSV: ${error.message}`);
                setImporting(false);
            }
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
            Swal.fire({
                toast: true,
                position: 'top-right',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Student created successfully.',
                customClass: {
                    popup: 'swal-toast',
                },
                backdrop: false,
            });
        } catch (error) {
            console.error('Failed to create student:', error.response ? error.response.data : error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to create student: ${error.response ? error.response.data.message : error.message}`,
            });
        }
    };

    const renderClassSelector = () => {
        if (classes.length === 1) {
            return <h3 className="text-lg font-semibold leading-6 text-gray-900 pb-8">Add Student(s) to {classes[0].name}</h3>;
        }
        return (
            <div className="mb-8">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 pb-4">Select a Class to Add Students</h3>
                <select
                    name="class"
                    value={selectedClassForAdd ? selectedClassForAdd._id : ''}
                    onChange={(e) => {
                        const selected = e.target.value ? classes.find(cls => cls._id === e.target.value) : null;
                        setSelectedClassForAdd(selected);
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                    required
                >
                    <option value="">Select a class</option>
                    {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {renderClassSelector()}

            {selectedClassForAdd && (
                <>
                    <div className="space-y-4 pb-8">
                        <div className="relative mt-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Add students one at a time</span>
                            </div>
                        </div>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <label className="block">
                                First Name
                                <input
                                    type="text"
                                    name="studentFirstName"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                                    placeholder="Student first name"
                                    value={newStudentFirstName}
                                    onChange={(e) => setNewStudentFirstName(e.target.value)}
                                    required
                                />
                            </label>
                            <label className="block">
                                Last Name
                                <input
                                    type="text"
                                    name="studentLastName"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                                    placeholder="Student last name"
                                    value={newStudentLastName}
                                    onChange={(e) => setNewStudentLastName(e.target.value)}
                                    required
                                />
                            </label>
                            <div className="flex space-x-4">
                                <label className="block w-1/2">
                                    PIN
                                    <input
                                        type="text"
                                        name="studentPin"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                                        placeholder="4-digit PIN"
                                        value={newStudentPin}
                                        onChange={(e) => setNewStudentPin(e.target.value)}
                                        required
                                        pattern="\d{4}"
                                        title="PIN should be a 4-digit number"
                                    />
                                </label>
                                <label className="block w-1/2">
                                    Reading Level (optional)
                                    <input
                                        type="text"
                                        name="studentReadingLevel"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 sm:text-sm"
                                        placeholder="Reading Level (optional)"
                                        value={newStudentReadingLevel}
                                        onChange={(e) => setNewStudentReadingLevel(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-md bg-pink-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-700 focus:ring-offset-2"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="relative mt-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">or bulk add by CSV</span>
                        </div>
                    </div>

                    <div className="mt-8 bg-gray-50 shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h4 className="text-md font-semibold leading-6 text-gray-900">
                                Add Students to {selectedClassForAdd.name}
                            </h4>
                            <div className="mt-2 max-w-xl text-sm text-gray-500">
                                <p>Upload a CSV file to bulk import students into this class. Ensure your CSV has the following headers: FirstName, LastName, PIN, ReadingLevel (optional).</p>
                            </div>
                            <div {...getRootProps()} className={`mt-5 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer ${isDragActive ? 'bg-gray-100' : ''}`}>
                                <input {...getInputProps()} />
                                {isDragActive ? (
                                    <p>Drop the CSV file here...</p>
                                ) : (
                                    <p>Drag 'n' drop a CSV file here, or click to select one</p>
                                )}
                            </div>

                            {file && (
                                <div className="mt-4">
                                    <p>Selected file: {file.name}</p>
                                    {preview.length > 0 && (
                                        <div className="mt-4 overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        {preview[0].map((header, index) => (
                                                            <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {preview.slice(1).map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            {row.map((cell, cellIndex) => (
                                                                <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <div className="mt-5">
                                <button
                                    onClick={handleImport}
                                    disabled={!file || importing}
                                    className="inline-flex items-center rounded-md bg-teal-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {importing ? 'Importing...' : 'Import'}
                                </button>
                            </div>

                            {importResults && (
                                <div className="mt-4">
                                    <h4 className="font-semibold">Import Results:</h4>
                                    <p>Successfully imported: {importResults.success}</p>
                                    <p>Failed to import: {importResults.failed}</p>
                                    {importResults.errors.length > 0 && (
                                        <div>
                                            <h5 className="font-semibold mt-2">Errors:</h5>
                                            <ul className="list-disc list-inside">
                                                {importResults.errors.map((error, index) => (
                                                    <li key={index} className="text-red-500">{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentAdd;
