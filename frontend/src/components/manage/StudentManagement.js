import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { updateStudent, deleteStudent } from '../../services/studentService';
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

    useEffect(() => {
        if (classes.length > 0 && !selectedClass) {
            setSelectedClass(classes[0]);
        }
    }, [classes, selectedClass]);

    if (!classes || classes.length === 0) {
        return <div>Loading classes...</div>;
    }

    const showNotification = (message, icon) => {
        Swal.fire({
            toast: true,
            position: 'bottom-right',
            showConfirmButton: false,
            timer: 3000,
            icon,
            title: message,
            timerProgressBar: true,
        });
    };

    const handleCSVImportComplete = () => {
        showNotification('CSV import completed successfully.', 'success');
        fetchStudents(selectedClass._id); // Refresh the student list
    };

    const handleSaveStudent = async (updatedStudent) => {

        try {
            // Ensure we're sending the class ID, not the whole object
            const studentToUpdate = {
                ...updatedStudent,
                class: updatedStudent.class._id
            };

            const savedStudent = await updateStudent(updatedStudent._id, studentToUpdate);

            // Find the full class object
            const fullClass = classes.find(cls => cls._id === savedStudent.class);

            // Create a new student object with the full class information
            const updatedStudentWithFullClass = {
                ...savedStudent,
                class: fullClass || { _id: savedStudent.class, name: 'Unknown Class' }
            };

            // Update the students array
            setStudents(prevStudents => prevStudents.map(s =>
                s._id === updatedStudentWithFullClass._id ? updatedStudentWithFullClass : s
            ));

            setSelectedStudent(updatedStudentWithFullClass);
            showNotification('Student updated successfully.', 'success');
            setIsEditing(false);
            setIsSlideoutOpen(true);
        } catch (error) {
            console.error('Failed to update student:', error);
            showNotification('Failed to update student.', 'error');
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
            showNotification('Student deleted successfully.', 'success');
        } catch (error) {
            console.error('Failed to delete student:', error);
            showNotification('Failed to delete student.', 'error');
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
            <div className="relative mt-8">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex items-center justify-between px-4">
                    <span className={`bg-white pr-3 text-base leading-6 ${!selectedClass ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}>
                        {!selectedClass ? "Select a class before adding students" : "Manage Students"}
                    </span>
                    <button
                        type="button"
                        className={`inline-flex items-center gap-x-1.5 rounded-full px-4 py-2 text-base font-semibold shadow-sm ring-1 ring-inset ${!selectedClass ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'}`}
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
                        href="/manage-classes"
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
