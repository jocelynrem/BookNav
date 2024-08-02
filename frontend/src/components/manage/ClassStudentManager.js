import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import ClassesPanel from './ClassesPanel';
import StudentsPanel from './StudentsPanel';
import { getClasses, getStudentsByClass, moveStudent } from '../../services/classService';

const ClassStudentManager = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);

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
            const classesWithStudentCount = await Promise.all(fetchedClasses.map(async (cls) => {
                const students = await getStudentsByClass(cls._id);
                return { ...cls, studentCount: students.length };
            }));
            setClasses(classesWithStudentCount);
            if (classesWithStudentCount.length > 0) {
                setSelectedClass(classesWithStudentCount[0]);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            Swal.fire('Error', 'Failed to fetch classes. Please try again.', 'error');
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const fetchedStudents = await getStudentsByClass(classId);
            setStudents(fetchedStudents);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const newClassId = destination.droppableId;

        if (newClassId !== selectedClass._id) {
            try {
                await moveStudent(draggableId, newClassId);
                // Refresh students for both classes
                await fetchStudents(selectedClass._id);
                await fetchClasses(); // To update student counts
            } catch (error) {
                console.error('Failed to move student:', error);
            }
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row">
                <ClassesPanel
                    classes={classes}
                    selectedClass={selectedClass}
                    setSelectedClass={setSelectedClass}
                    refreshClasses={fetchClasses}
                />
                <StudentsPanel
                    students={students}
                    selectedClass={selectedClass}
                    refreshStudents={() => fetchStudents(selectedClass._id)}
                />
            </div>
        </DragDropContext>
    );
};

export default ClassStudentManager;