import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        await fetchData();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {student.firstName}!</h1>
                    <button
                        onClick={() => setIsActionPanelOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Checkout a Book
                    </button>
                </div>
                <CurrentCheckouts checkouts={currentCheckouts} onReturn={handleBookAction} />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <ReadingHistory history={readingHistory} />
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