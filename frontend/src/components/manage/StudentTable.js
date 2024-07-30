import React, { useState, useEffect } from 'react';
import { getStudentsByClass, updateStudent, deleteStudent } from '../../services/studentService';
import Swal from 'sweetalert2';
import StudentTableHeader from './StudentTableHeader';
import StudentRow from './StudentRow';
import Pagination from './Pagination';
import TableControls from './TableControls';
import EmptyState from './EmptyState';
import SlideoutParent from '../slideout/SlideoutParent';
import StudentDetails from '../slideout/StudentDetails';
import StudentEdit from '../slideout/StudentEdit';

const StudentTable = ({ students, setStudents, classes }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [sortField, setSortField] = useState('firstName');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedClassForView, setSelectedClassForView] = useState({ _id: 'all', name: 'All Classes' });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, [selectedClassForView]);

    const fetchStudents = async () => {
        try {
            let fetchedStudents;
            if (selectedClassForView && selectedClassForView._id !== 'all') {
                fetchedStudents = await getStudentsByClass(selectedClassForView._id);
            } else {
                fetchedStudents = await getStudentsByClass('all'); // Fetch all students
            }
            setStudents(fetchedStudents);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            Swal.fire('Error', 'Failed to fetch students. Please try again.', 'error');
        }
    };

    const handleClassChangeForView = (selectedClass) => {
        setSelectedClassForView(selectedClass || { _id: 'all', name: 'All Classes' });
        setStudents([]); // Clear the current students to force fetch on the next render
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsSlideoutOpen(true);
        setIsEditing(false);
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setIsEditing(true);
        setIsSlideoutOpen(true);
    };

    const handleSaveStudent = async (updatedStudent) => {
        try {
            const savedStudent = await updateStudent(updatedStudent._id, updatedStudent);
            const fullClass = classes.find(cls => cls._id === savedStudent.class);
            const updatedStudentWithFullClass = {
                ...savedStudent,
                class: fullClass || { _id: savedStudent.class, name: 'Unknown Class' }
            };

            setStudents(students.map(s => s._id === updatedStudentWithFullClass._id ? updatedStudentWithFullClass : s));
            setSelectedStudent(updatedStudentWithFullClass);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await deleteStudent(studentId);
            setStudents(students.filter(s => s._id !== studentId));
            setIsSlideoutOpen(false);
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    const handleDeleteSelectedStudents = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete the selected students and all of their data? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all(selectedStudents.map(studentId => deleteStudent(studentId)));
                    setStudents(students.filter(s => !selectedStudents.includes(s._id)));
                    setSelectedStudents([]);
                    Swal.fire('Deleted!', 'The selected students have been deleted.', 'success');
                } catch (error) {
                    console.error('Failed to delete students:', error);
                }
            }
        });
    };

    const handleCloseSlideout = () => {
        setIsSlideoutOpen(false);
        setIsEditing(false);
    };

    const handleSortChange = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prevSelected => prevSelected.includes(studentId) ? prevSelected.filter(id => id !== studentId) : [...prevSelected, studentId]);
    };

    const handleSelectAllStudents = () => {
        if (selectedStudents.length === currentStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(currentStudents.map(student => student._id));
        }
    };

    const filteredStudents = students.filter(student => {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        const className = student.class?.name ? student.class.name.toLowerCase() : '';
        const grade = student.grade?.toString() || '';

        return fullName.includes(searchQuery.toLowerCase()) ||
            grade.includes(searchQuery.toLowerCase()) ||
            className.includes(searchQuery.toLowerCase());
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'name') {
            aValue = `${a.firstName || ''} ${a.lastName || ''}`;
            bValue = `${b.firstName || ''} ${b.lastName || ''}`;
        } else if (sortField === 'class') {
            aValue = a.class ? a.class.name : '';
            bValue = b.class ? b.class.name : '';
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
    const currentStudents = sortedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const slideoutContent = selectedStudent && (
        isEditing ? (
            <StudentEdit
                student={selectedStudent}
                onSave={handleSaveStudent}
                onClose={handleCloseSlideout}
                onView={() => setIsEditing(false)}
                onDelete={handleDeleteStudent}
                classes={classes}
            />
        ) : (
            <StudentDetails
                student={selectedStudent}
                onEdit={() => handleEditStudent(selectedStudent)}
                onClose={handleCloseSlideout}
                classes={classes}
            />
        )
    );

    const isEmpty = students.length === 0;

    return (
        <div>
            <TableControls
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                sortField={sortField}
                selectedClassForView={selectedClassForView}
                classes={classes}
                onClassChange={handleClassChangeForView}
            />
            {isEmpty ? (
                <EmptyState />
            ) : (
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="flex justify-between mb-4 sm:justify-end px-5 lg:px-8">
                                <button
                                    onClick={handleDeleteSelectedStudents}
                                    disabled={selectedStudents.length === 0}
                                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Delete Selected
                                </button>
                            </div>
                            <table className="min-w-full divide-y divide-gray-300">
                                <StudentTableHeader
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    onSortChange={handleSortChange}
                                    selectedStudents={selectedStudents}
                                    onSelectAllStudents={handleSelectAllStudents}
                                    currentStudents={currentStudents}
                                />
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {currentStudents.map((student) => (
                                        <StudentRow
                                            key={student._id}
                                            student={student}
                                            selectedStudents={selectedStudents}
                                            onSelectStudent={handleSelectStudent}
                                            onStudentClick={handleStudentClick}
                                            onEditStudent={handleEditStudent}
                                        />
                                    ))}
                                </tbody>
                            </table>
                            {sortedStudents.length > itemsPerPage && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={sortedStudents.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
            <SlideoutParent
                isOpen={isSlideoutOpen}
                onClose={handleCloseSlideout}
                title={isEditing ? 'Edit Student' : 'Student Details'}
            >
                {slideoutContent}
            </SlideoutParent>
        </div>
    );
};

export default StudentTable;
