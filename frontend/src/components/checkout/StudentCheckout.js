import React, { useState } from 'react';
import { checkoutBook, returnBook } from '../../services/checkoutService';
import { getStudents } from '../../services/studentService';
import ISBNScanner from './ISBNScanner';

const StudentCheckout = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [pin, setPin] = useState('');
    const [isbn, setIsbn] = useState('');
    const [action, setAction] = useState('checkout');
    const [message, setMessage] = useState('');
    const [step, setStep] = useState('selectStudent');

    React.useEffect(() => {
        const fetchStudents = async () => {
            const fetchedStudents = await getStudents();
            setStudents(fetchedStudents);
        };
        fetchStudents();
    }, []);

    const handleStudentSelect = (studentId) => {
        setSelectedStudent(studentId);
        setStep('enterPin');
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        // Here you would typically verify the PIN with the backend
        // For now, we'll just move to the next step
        setStep('selectAction');
    };

    const handleActionSelect = (selectedAction) => {
        setAction(selectedAction);
        setStep('scanBook');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (action === 'checkout') {
                await checkoutBook(isbn, selectedStudent);
                setMessage(`Book checked out successfully`);
            } else {
                await returnBook(isbn);
                setMessage('Book returned successfully');
            }
            setIsbn('');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'selectStudent':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {students.map((student) => (
                            <button
                                key={student._id}
                                onClick={() => handleStudentSelect(student._id)}
                                className="bg-blue-500 text-white p-4 rounded text-xl"
                            >
                                {student.firstName} {student.lastName}
                            </button>
                        ))}
                    </div>
                );
            case 'enterPin':
                return (
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter your PIN"
                            className="w-full p-4 border rounded text-xl"
                            required
                        />
                        <button type="submit" className="w-full bg-green-500 text-white p-4 rounded text-xl">
                            Submit PIN
                        </button>
                    </form>
                );
            case 'selectAction':
                return (
                    <div className="space-y-4">
                        <button
                            onClick={() => handleActionSelect('checkout')}
                            className="w-full bg-blue-500 text-white p-4 rounded text-xl"
                        >
                            Checkout Book
                        </button>
                        <button
                            onClick={() => handleActionSelect('return')}
                            className="w-full bg-green-500 text-white p-4 rounded text-xl"
                        >
                            Return Book
                        </button>
                    </div>
                );
            case 'scanBook':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <ISBNScanner onScan={setIsbn} />
                        <input
                            type="text"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            placeholder="Enter ISBN"
                            className="w-full p-4 border rounded text-xl"
                            required
                        />
                        <button type="submit" className="w-full bg-purple-500 text-white p-4 rounded text-xl">
                            {action === 'checkout' ? 'Checkout' : 'Return'} Book
                        </button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-3xl font-bold mb-8 text-center">Student Checkout</h2>
            {renderStep()}
            {message && <p className="mt-4 text-center text-xl">{message}</p>}
        </div>
    );
};

export default StudentCheckout;