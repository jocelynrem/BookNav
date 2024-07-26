import React, { useState, useEffect } from 'react';
import ClassManagement from './ClassManagement';
import { getClasses } from '../../services/classService';
import { getStudents } from '../../services/studentService';

const ManageClasses = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchClassesAndStudents();
    }, []);

    const fetchClassesAndStudents = async () => {
        try {
            const [fetchedClasses, fetchedStudents] = await Promise.all([getClasses(), getStudents()]);
            setClasses(fetchedClasses);
            setStudents(fetchedStudents || []);
            updateStudentCounts(fetchedClasses, fetchedStudents);
        } catch (error) {
            console.error('Failed to fetch classes or students:', error);
        }
    };

    const updateStudentCounts = (fetchedClasses, fetchedStudents) => {
        const updatedClasses = fetchedClasses.map(cls => {
            const studentCount = fetchedStudents.filter(student => student.class._id === cls._id).length;
            return { ...cls, studentCount };
        });
        setClasses(updatedClasses);
    };

    return (
        <div>
            <ClassManagement
                classes={classes}
                setClasses={setClasses}
            />
        </div>
    );
};

export default ManageClasses;
