import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { createStudent } from '../../services/studentService';

const CSVImport = ({ onImportComplete, selectedClass }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [error, setError] = useState(null);

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
        accept: '.csv',
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
                            classId: selectedClass._id
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

    return (
        <div className="mt-8 bg-gray-50 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Import Students from CSV for {selectedClass.name}
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Upload a CSV file to bulk import students into this class. Ensure your CSV has the following headers: FirstName, LastName, PIN, ReadingLevel (optional).</p>
                </div>
                <div {...getRootProps()} className={`mt-5 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'bg-gray-100' : ''}`}>
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
                                                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {preview.slice(1).map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
    );
};

export default CSVImport;
