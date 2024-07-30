import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { updateStudent, deleteStudent, getStudentsByClass } from '../../services/studentService';
import StudentTable from './StudentTable';
import SlideoutParent from '../slideout/SlideoutParent';
import StudentAdd from '../slideout/StudentAdd';
import StudentEdit from '../slideout/StudentEdit';
import StudentDetails from '../slideout/StudentDetails';

const StudentManagement = ({ students, setStudents, classes, selectedClass, setSelectedClass }) => {
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', error: false, undo: false });
    const [dialog, setDialog] = useState({ open: false, title: '', content: '', onConfirm: () => { } });
    const [selectedClassForView, setSelectedClassForView] = useState({ _id: 'all', name: 'All Classes' });

    useEffect(() => {
        if (classes.length > 0 && !selectedClass) {
            setSelectedClass(classes[0]);
        }
    }, [classes, selectedClass]);

    const fetchStudents = async () => {
        try {
            const fetchedStudents = await getStudentsByClass(selectedClass ? selectedClass._id : 'all');
            setStudents(fetchedStudents);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const handleCSVImportComplete = () => {
        Swal.fire('Success', 'CSV import completed successfully.', 'success');
        setIsSlideoutOpen(false); // Close the AddStudent panel
        setSelectedClassForView({ _id: 'all', name: 'All Classes' }); // Reset dropdown to 'All Classes'
        setSelectedClass(null); // Reset selectedClass if needed
        fetchStudents(); // Refresh the student list
    };


    const handleSaveStudent = async (updatedStudent) => {
        try {
            const studentToUpdate = {
                ...updatedStudent,
                class: updatedStudent.class._id
            };

            const savedStudent = await updateStudent(updatedStudent._id, studentToUpdate);

            const fullClass = classes.find(cls => cls._id === savedStudent.class);

            const updatedStudentWithFullClass = {
                ...savedStudent,
                class: fullClass || { _id: savedStudent.class, name: 'Unknown Class' }
            };

            setStudents(prevStudents => prevStudents.map(s =>
                s._id === updatedStudentWithFullClass._id ? updatedStudentWithFullClass : s
            ));

            setSelectedStudent(updatedStudentWithFullClass);
            Swal.fire('Success', 'Student updated successfully.', 'success');
            setIsEditing(false);
            setIsSlideoutOpen(true);
        } catch (error) {
            console.error('Failed to update student:', error);
            Swal.fire('Error', 'Failed to update student. Please try again.', 'error');
        }
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setIsEditing(true);
        setIsSlideoutOpen(true);
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await deleteStudent(studentId);
            setStudents(prevStudents => prevStudents.filter(s => s._id !== studentId));
            setSelectedStudent(null);
            setIsSlideoutOpen(false);
            Swal.fire('Success', 'Student deleted successfully.', 'success');
        } catch (error) {
            console.error('Failed to delete student:', error);
            Swal.fire('Error', 'Failed to delete student. Please try again.', 'error');
        }
    };

    const openSlideout = (isAdding = false) => {
        setIsAdding(isAdding);
        setIsSlideoutOpen(true);
        setIsEditing(false);
    };

    const closeSlideout = () => {
        setIsSlideoutOpen(false);
        setIsEditing(false);
        setIsAdding(false);
    };

    return (
        <div className="mt-8">
            <div className="relative mt-8 mb-8">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex items-center justify-between px-4">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-700 focus:ring-offset-2"
                        onClick={() => openSlideout(true)}
                        disabled={!selectedClass}
                    >
                        Add Students
                    </button>
                </div>
            </div>

            {selectedClass && (
                <StudentTable
                    students={students}
                    setStudents={setStudents}
                    classes={classes}
                    selectedClass={selectedClass}
                    onEditStudent={handleEditStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onSaveStudent={handleSaveStudent}
                />
            )}

            <SlideoutParent
                isOpen={isSlideoutOpen}
                onClose={closeSlideout}
                title={isEditing ? 'Edit Student' : isAdding ? 'Add Student' : 'Student Details'}
                notification={notification}
                setNotification={setNotification}
                dialog={dialog}
                setDialog={setDialog}
            >
                {isAdding ? (
                    <StudentAdd
                        onImportComplete={handleCSVImportComplete}
                        selectedClass={selectedClass}
                        classes={classes}
                        students={students}
                        setStudents={setStudents}
                    />
                ) : (
                    selectedStudent && (
                        isEditing ? (
                            <StudentEdit
                                student={selectedStudent}
                                onSave={handleSaveStudent}
                                onView={() => setIsEditing(false)}
                                onDelete={handleDeleteStudent}
                                classes={classes}
                            />
                        ) : (
                            <StudentDetails
                                student={selectedStudent}
                                onEdit={() => setIsEditing(true)}
                                classes={classes}
                            />
                        )
                    )
                )}
            </SlideoutParent>

            {!selectedClass && (
                <div className="mt-8 text-center">
                    <p className="text-gray-500">No classes available. Please add a class first.</p>
                    <a
                        href="/manage/classes"
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Manage Classes
                    </a>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
