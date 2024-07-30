import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import ClassManagement from '../components/manage/ClassManagement';
import StudentManagement from '../components/manage/StudentManagement';
import { getClasses } from '../services/classService';
import { getStudents, getStudentsByClass } from '../services/studentService';
import Tabs from './tabs/ManageTabs';
import Breadcrumbs from '../components/dashboard/Breadcrumbs';

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

    const getBreadcrumbItems = () => {
        const path = location.pathname;
        const items = [{ name: 'Manage', href: '/manage/classes' }];

        if (path.includes('classes')) {
            items.push({ name: 'Classes', href: '/manage/classes' });
        } else if (path.includes('students')) {
            items.push({ name: 'Students', href: '/manage/students' });
        }

        return items;
    };

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Breadcrumbs items={getBreadcrumbItems()} />
            </div>
            <Tabs />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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