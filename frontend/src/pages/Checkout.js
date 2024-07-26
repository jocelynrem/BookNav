import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import CheckoutTabs from './tabs/CheckoutTabs';
import TeacherCheckout from '../components/checkout/TeacherCheckout';
import StudentCheckout from '../components/checkout/StudentCheckout';

const Checkout = () => {
    return (
        <div>
            <CheckoutTabs />
            <div className="p-4 sm:p-6 lg:p-8">
                <Routes>
                    <Route path="teacher" element={<TeacherCheckout />} />
                    <Route path="student" element={<StudentCheckout />} />
                    <Route path="*" element={<Navigate to="teacher" />} />
                </Routes>
            </div>
        </div>
    );
};

export default Checkout;
