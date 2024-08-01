import React, { useState, useEffect } from 'react';
import ActionPanelModal from '../components/checkout/ActionPanelModal';
import CurrentCheckouts from '../components/checkout/CurrentCheckouts';
import ReadingHistory from '../components/checkout/ReadingHistory';
import { getCurrentCheckouts, getDetailedReadingHistory } from '../services/checkoutService';

const StudentDashboard = ({ student, onLogout }) => {
    const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);
    const [currentCheckouts, setCurrentCheckouts] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);

    useEffect(() => {
        fetchData();
    }, [student]);

    const fetchData = async () => {
        await Promise.all([fetchCurrentCheckouts(), fetchReadingHistory()]);
    };

    const fetchCurrentCheckouts = async () => {
        try {
            const checkouts = await getCurrentCheckouts(student._id);
            setCurrentCheckouts(checkouts);
        } catch (error) {
            console.error('Error fetching current checkouts:', error);
            setCurrentCheckouts([]);
        }
    };

    const fetchReadingHistory = async () => {
        try {
            const history = await getDetailedReadingHistory(student._id);
            setReadingHistory(history);
        } catch (error) {
            console.error('Error fetching reading history:', error);
        }
    };

    const handleBookAction = async () => {
        await fetchCurrentCheckouts();
        setIsActionPanelOpen(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Welcome, {student.firstName}!</h1>
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={() => setIsActionPanelOpen(true)}
                            className="mb-8 bg-teal-600 text-white w-full px-3 py-5 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            Checkout a Book
                        </button>
                        <button
                            onClick={onLogout}
                            className="text-red-700 font-semibold w-full px-3 py-2 rounded-md hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <CurrentCheckouts checkouts={currentCheckouts} onReturn={handleBookAction} />
            </div>

            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                <ReadingHistory history={readingHistory} />
                {readingHistory.length === 0 && (
                    <p className="mt-4 text-center text-gray-500">
                        Your reading history is empty. Start your reading journey by checking out a book!
                    </p>
                )}
            </div>

            <ActionPanelModal
                isOpen={isActionPanelOpen}
                onClose={() => setIsActionPanelOpen(false)}
                student={student}
                onConfirmAction={handleBookAction}
            />
        </div>
    );
};

export default StudentDashboard;