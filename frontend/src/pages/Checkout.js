import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TeacherCheckout from '../components/checkout/TeacherCheckout';
import StudentCheckout from '../components/checkout/StudentCheckout';
import Breadcrumbs from '../components/dashboard/Breadcrumbs';

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

    const getBreadcrumbItems = () => {
        const items = [{ name: 'Checkout', href: '/checkout' }];
        if (isStudentMode) {
            items.push({ name: 'Student Mode', href: '/checkout?mode=student' });
        } else {
            items.push({ name: 'Teacher Mode', href: '/checkout' });
        }
        return items;
    };

    return (
        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            <div className="mb-4">
                <Breadcrumbs items={getBreadcrumbItems()} />
            </div>
            {isStudentMode ? (
                <StudentCheckout onExit={exitStudentMode} />
            ) : (
                <TeacherCheckout onStartStudentMode={startStudentMode} />
            )}
        </div>
    );
};

export default Checkout;