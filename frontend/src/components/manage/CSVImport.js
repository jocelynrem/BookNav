//frontend/src/components/manage/CSVImport.js
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { createStudent } from '../../services/studentService';

const CSVImport = ({ onImportComplete }) => {
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

                    if (!student.firstname || !student.lastname || !student.studentid) {
                        results.failed++;
                        results.errors.push(`Missing required fields for student: ${JSON.stringify(student)}`);
                        continue;
                    }

                    try {
                        await createStudent({
                            firstName: student.firstname,
                            lastName: student.lastname,
                            studentId: student.studentid,
                            grade: student.grade,
                            classId: student.classid,
                            pin: student.pin || '0000' // Default PIN if not provided
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
        <div className="mt-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Import Students from CSV</h3>

            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer">
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the CSV file here ...</p>
                ) : (
                    <p>Drag 'n' drop a CSV file here, or click to select one</p>
                )}
            </div>

            {file && (
                <div className="mt-4">
                    <p>Selected file: {file.name}</p>
                    {preview.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold">Preview:</h4>
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
                <div className="mt-4 text-red-500">
                    {error}
                </div>
            )}

            <button
                onClick={handleImport}
                disabled={!file || importing}
                className="mt-4 bg-green-500 text-white p-2 rounded disabled:opacity-50"
            >
                {importing ? 'Importing...' : 'Import'}
            </button>

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
    );
};

export default CSVImport;