import React, { useState, useEffect } from 'react';
import StudentManagement from '../components/manage/StudentManagement';
import { getClasses } from '../services/classService';
import { getStudentsByClass } from '../services/studentService';

const ManageStudents = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (classes.length > 0) {
            setSelectedClass({ _id: 'all', name: 'All Classes' });
        }
    }, [classes]);

    useEffect(() => {
        if (selectedClass) {
            fetchStudentsByClass(selectedClass._id);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const fetchedClasses = await getClasses();
            setClasses(fetchedClasses);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const fetchStudentsByClass = async (classId) => {
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
            <StudentManagement
                students={students}
                setStudents={setStudents}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                classes={classes}
            />
        </div>
    );
};

export default ManageStudents;
