import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { createStudent } from '../../services/studentService';

const CSVImport = ({ onImportComplete, selectedClass, onClose }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [error, setError] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full">
                <h2 className="text-2xl font-bold mb-4">
                    {selectedClass ? `Import Students from CSV for ${selectedClass.name}` : "Select a class to import students"}
                </h2>
                <div className="mt-2 text-sm text-gray-500 mb-4">
                    <p>Upload a CSV file to bulk import students into this class. Ensure your CSV has the following headers: FirstName, LastName, PIN, ReadingLevel (optional).</p>
                </div>
                <div {...getRootProps()} className={`mt-5 border-2 border-dashed border-teal-600 rounded-lg p-4 text-center cursor-pointer ${isDragActive ? 'bg-teal-50' : ''}`}>
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

                <div className="mt-5 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || importing}
                        className="inline-flex items-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
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