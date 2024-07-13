import React, { useState, useEffect } from 'react';
import ClassManagement from './ClassManagement';
import StudentManagement from './StudentManagement';
import { getClasses } from '../../services/classService';

const ManagementPage = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]); // Initialize students as an empty array
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents(selectedClass._id);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const fetchedClasses = await getClasses();
            setClasses(fetchedClasses);
            if (fetchedClasses.length > 0) {
                setSelectedClass(fetchedClasses[0]);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const fetchedStudents = await getStudents(classId);
            setStudents(fetchedStudents || []); // Ensure fetchedStudents is always an array
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudents([]); // Set students as an empty array on error
        }
    };

    return (
        <div>
            <ClassManagement
                classes={classes}
                setClasses={setClasses}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
            />
            <StudentManagement
                students={students}
                setStudents={setStudents}
                selectedClass={selectedClass}
            />
        </div>
    );
};

export default ManagementPage;
