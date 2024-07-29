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
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isStudentMode ? (
                <StudentCheckout onExit={exitStudentMode} />
            ) : (
                <div>
                    <div className="flex space-x-4 justify-end">
                        <button
                            onClick={startStudentMode}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-md py-2 px-4 rounded"
                        >
                            Start Student Mode
                        </button>
                    </div>
                    <div className="mt-8">
                        <TeacherCheckout />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;