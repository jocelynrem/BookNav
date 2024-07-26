import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import ClassManagement from '../components/manage/ClassManagement';
import StudentManagement from '../components/manage/StudentManagement';
import { getClasses } from '../services/classService';
import { getStudents, getStudentsByClass } from '../services/studentService';
import Tabs from './tabs/ManageTabs';

const Manage = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const location = useLocation();

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
            const fetchedStudents = classId === 'all' ? await getStudents() : await getStudentsByClass(classId);
            setStudents(fetchedStudents || []);
        } catch (error) {
            console.error('Failed to fetch students by class:', error);
            setStudents([]);
        }
    };

    return (
        <div>
            <Tabs />
            <div className="p-4 sm:p-6 lg:p-8">
                <Routes>
                    <Route path="classes" element={<ClassManagement classes={classes} setClasses={setClasses} />} />
                    <Route path="students" element={<StudentManagement
                        students={students}
                        setStudents={setStudents}
                        selectedClass={selectedClass}
                        setSelectedClass={setSelectedClass}
                        classes={classes}
                    />} />
                    <Route path="*" element={<Navigate to="classes" />} />
                </Routes>
            </div>
        </div>
    );
};

export default Manage;
