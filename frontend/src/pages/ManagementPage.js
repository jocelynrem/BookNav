//frontend/src/pages/ManagementPage.js
import React, { useState, useEffect } from 'react';
import ClassManagement from '../components/manage/ClassManagement';
import StudentManagement from '../components/manage/StudentManagement';
import { getClasses } from '../services/classService';
import { getStudents } from '../services/studentService';

const ManagementPage = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClassForManagement, setSelectedClassForManagement] = useState(null);
    const [selectedClassForStudents, setSelectedClassForStudents] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassForStudents) {
            fetchStudents(selectedClassForStudents._id);
        }
    }, [selectedClassForStudents]);

    const fetchClasses = async () => {
        try {
            const fetchedClasses = await getClasses();
            setClasses(fetchedClasses);
            if (fetchedClasses.length > 0) {
                setSelectedClassForManagement(fetchedClasses[0]);
                setSelectedClassForStudents(fetchedClasses[0]);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const fetchedStudents = await getStudents(classId);
            setStudents(fetchedStudents || []);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudents([]);
        }
    };

    return (
        <div>
            <ClassManagement
                classes={classes}
                setClasses={setClasses}
                selectedClass={selectedClassForManagement}
                setSelectedClass={setSelectedClassForManagement}
            />
            <StudentManagement
                students={students}
                setStudents={setStudents}
                selectedClass={selectedClassForStudents}
                setSelectedClass={setSelectedClassForStudents}
                classes={classes}
            />
        </div>
    );
};

export default ManagementPage;