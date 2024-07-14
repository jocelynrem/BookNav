import React, { useState, useEffect } from 'react';
import ClassManagement from '../components/manage/ClassManagement';
import StudentManagement from '../components/manage/StudentManagement';
import { getClasses } from '../services/classService';
import { getStudents, getStudentsByClass } from '../services/studentService';

const ManagementPage = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClassForManagement, setSelectedClassForManagement] = useState(null);
    const [selectedClassForStudents, setSelectedClassForStudents] = useState(null);

    useEffect(() => {
        fetchClasses();
        fetchAllStudents();
    }, []);

    useEffect(() => {
        if (selectedClassForStudents) {
            fetchStudentsByClass(selectedClassForStudents._id);
        } else {
            fetchAllStudents();
        }
    }, [selectedClassForStudents]);

    const fetchClasses = async () => {
        try {
            const fetchedClasses = await getClasses();
            setClasses(fetchedClasses);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const fetchedStudents = await getStudents();
            setStudents(fetchedStudents || []);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudents([]);
        }
    };

    const fetchStudentsByClass = async (classId) => {
        if (classId === 'all') {
            fetchAllStudents();
            return;
        }
        try {
            const fetchedStudents = await getStudentsByClass(classId);
            setStudents(fetchedStudents || []);
        } catch (error) {
            console.error('Failed to fetch students by class:', error);
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
