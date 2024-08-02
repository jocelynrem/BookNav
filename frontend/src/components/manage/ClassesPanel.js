import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon, MinusIcon, PencilIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import ClassForm from './ClassForm';
import { deleteClass } from '../../services/classService';
import Swal from 'sweetalert2';

const ClassesPanel = ({ classes, selectedClass, setSelectedClass, refreshClasses }) => {
    const [isAddingClass, setIsAddingClass] = useState(false);
    const [editingClassId, setEditingClassId] = useState(null);

    const handleToggleAddClass = () => {
        setIsAddingClass(!isAddingClass);
        setEditingClassId(null);
    };

    const handleToggleEditClass = (classId) => {
        setEditingClassId(prev => prev === classId ? null : classId);
        setIsAddingClass(false);
    };

    const handleDeleteClass = async (classId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You are about to delete this class. All students in this class will also be deleted. This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteClass(classId);
                refreshClasses();
                Swal.fire('Deleted!', 'The class has been deleted.', 'success');
            } catch (error) {
                console.error('Failed to delete class:', error);
                Swal.fire('Error', 'Failed to delete class. Please try again.', 'error');
            }
        }
    };

    const handleClassFormClose = () => {
        setIsAddingClass(false);
        setEditingClassId(null);
    };

    return (
        <div className="w-full md:w-1/3 p-4 border-r">
            <h2 className="text-xl font-bold mb-4">Classes</h2>
            <div className="flex mb-4 space-x-2">
                <button
                    onClick={handleToggleAddClass}
                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800"
                >
                    {isAddingClass ? (
                        <MinusIcon className="h-5 w-5 mr-2" />
                    ) : (
                        <PlusIcon className="h-5 w-5 mr-2" />
                    )}
                    {isAddingClass ? 'Cancel' : 'Add Class'}
                </button>
            </div>

            {isAddingClass && (
                <div className="mb-4">
                    <ClassForm
                        onSave={() => {
                            refreshClasses();
                            handleClassFormClose();
                        }}
                        onClose={handleClassFormClose}
                    />
                </div>
            )}
            {classes.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-gray-500">No classes yet. Start by adding a new class.</p>
                </div>
            ) : (
                <Droppable droppableId="classes-list">
                    {(provided) => (
                        <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {classes.map((classItem, index) => (
                                <Draggable key={classItem._id} draggableId={classItem._id} index={index}>
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedClass && selectedClass._id === classItem._id ? 'bg-gray-50' : 'hover:bg-gray-100'
                                                }`}
                                            onClick={() => setSelectedClass(classItem)}
                                        >
                                            <span>{classItem.name} ({classItem.studentCount || 0})</span>
                                            <div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleEditClass(classItem._id);
                                                    }}
                                                    className={`text-teal-700 hover:text-teal-800 mr-2 ${editingClassId === classItem._id ? 'bg-teal-100 p-1 rounded' : ''}`}
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClass(classItem._id);
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            )}
        </div>
    );
};

export default ClassesPanel;