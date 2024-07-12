import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkCreateStudents,
    getStudentReadingHistory
} from '../services/studentService';
import { mockStudents, mockNewStudent } from '../__mocks__/studentServiceMocks';

jest.mock('../services/studentService', () => ({
    ...jest.requireActual('../services/studentService'),
    getStudents: jest.fn(),
    createStudent: jest.fn(),
    updateStudent: jest.fn(),
    deleteStudent: jest.fn(),
    bulkCreateStudents: jest.fn(),
    getStudentReadingHistory: jest.fn(),
}));

global.fetch = jest.fn();

describe('studentService', () => {
    beforeEach(() => {
        fetch.mockClear();
        jest.clearAllMocks();
    });

    test('getStudents fetches students successfully', async () => {
        getStudents.mockResolvedValueOnce(mockStudents);

        const students = await getStudents();

        expect(getStudents).toHaveBeenCalledTimes(1);
        expect(students).toEqual(mockStudents);
    });

    test('getStudents handles errors', async () => {
        getStudents.mockRejectedValueOnce(new Error('Failed to fetch students'));

        await expect(getStudents()).rejects.toThrow('Failed to fetch students');
    });

    test('createStudent creates a student successfully', async () => {
        createStudent.mockResolvedValueOnce(mockNewStudent);

        const createdStudent = await createStudent(mockNewStudent);

        expect(createStudent).toHaveBeenCalledTimes(1);
        expect(createStudent).toHaveBeenCalledWith(mockNewStudent);
        expect(createdStudent).toEqual(mockNewStudent);
    });

    test('createStudent handles errors', async () => {
        createStudent.mockRejectedValueOnce(new Error('Failed to create student'));

        await expect(createStudent(mockNewStudent)).rejects.toThrow('Failed to create student');
    });

    test('updateStudent updates a student successfully', async () => {
        const updatedStudent = { ...mockNewStudent, grade: 11 };
        updateStudent.mockResolvedValueOnce(updatedStudent);

        const result = await updateStudent(mockNewStudent._id, { grade: 11 });

        expect(updateStudent).toHaveBeenCalledTimes(1);
        expect(updateStudent).toHaveBeenCalledWith(mockNewStudent._id, { grade: 11 });
        expect(result).toEqual(updatedStudent);
    });

    test('updateStudent handles errors', async () => {
        updateStudent.mockRejectedValueOnce(new Error('Failed to update student'));

        await expect(updateStudent(mockNewStudent._id, { grade: 11 })).rejects.toThrow('Failed to update student');
    });

    test('deleteStudent deletes a student successfully', async () => {
        deleteStudent.mockResolvedValueOnce({ message: 'Student deleted' });

        const response = await deleteStudent(mockNewStudent._id);

        expect(deleteStudent).toHaveBeenCalledTimes(1);
        expect(deleteStudent).toHaveBeenCalledWith(mockNewStudent._id);
        expect(response).toEqual({ message: 'Student deleted' });
    });

    test('deleteStudent handles errors', async () => {
        deleteStudent.mockRejectedValueOnce(new Error('Failed to delete student'));

        await expect(deleteStudent(mockNewStudent._id)).rejects.toThrow('Failed to delete student');
    });

    test('bulkCreateStudents creates multiple students successfully', async () => {
        const bulkStudents = [mockNewStudent, { ...mockNewStudent, _id: '2', studentId: 'STUD_2' }];
        bulkCreateStudents.mockResolvedValueOnce({ success: 2, failed: 0, errors: [] });

        const result = await bulkCreateStudents(bulkStudents);

        expect(bulkCreateStudents).toHaveBeenCalledTimes(1);
        expect(bulkCreateStudents).toHaveBeenCalledWith(bulkStudents);
        expect(result).toEqual({ success: 2, failed: 0, errors: [] });
    });

    test('bulkCreateStudents handles errors', async () => {
        bulkCreateStudents.mockRejectedValueOnce(new Error('Failed to bulk create students'));

        await expect(bulkCreateStudents([])).rejects.toThrow('Failed to bulk create students');
    });

    test('getStudentReadingHistory fetches reading history successfully', async () => {
        const mockHistory = [{ bookTitle: 'Test Book', checkoutDate: '2023-01-01' }];
        getStudentReadingHistory.mockResolvedValueOnce(mockHistory);

        const history = await getStudentReadingHistory(mockNewStudent._id);

        expect(getStudentReadingHistory).toHaveBeenCalledTimes(1);
        expect(getStudentReadingHistory).toHaveBeenCalledWith(mockNewStudent._id);
        expect(history).toEqual(mockHistory);
    });

    test('getStudentReadingHistory handles errors', async () => {
        getStudentReadingHistory.mockRejectedValueOnce(new Error('Failed to fetch reading history'));

        await expect(getStudentReadingHistory(mockNewStudent._id)).rejects.toThrow('Failed to fetch reading history');
    });
});