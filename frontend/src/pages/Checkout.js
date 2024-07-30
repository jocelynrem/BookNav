import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TeacherCheckout from '../components/checkout/TeacherCheckout';
import StudentCheckout from '../components/checkout/StudentCheckout';

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isStudentMode = searchParams.get('mode') === 'student';

    const startStudentMode = () => {
        navigate('/checkout?mode=student');
    };

    const exitStudentMode = () => {
        navigate('/checkout');
    };

    return (
        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            {isStudentMode ? (
                <StudentCheckout onExit={exitStudentMode} />
            ) : (
                <div>
                    <div className="flex justify-end mb-3 sm:mb-4">
                        <button
                            onClick={startStudentMode}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded"
                        >
                            Start Student Mode
                        </button>
                    </div>
                    <div className="mt-4 sm:mt-6">
                        <TeacherCheckout />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
