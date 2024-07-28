import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MyLibrary from '../components/library/MyLibrary';
import AddBook from '../components/search/AddBook';
import Login from '../auth/Login';
import Register from '../auth/Register';
import PasswordReset from '../auth/PasswordReset';
import PasswordResetRequest from '../auth/PasswordResetRequest';
import PrivateRoute from '../auth/PrivateRoute';
import TeacherCheckout from '../components/checkout/TeacherCheckout';
import StudentCheckout from '../components/checkout/StudentCheckout';
import Dashboard from '../pages/Dashboard';
import LibraryPage from '../pages/LibraryPage';
import Manage from '../pages/Manage';
import Checkout from '../pages/Checkout';
import CheckedOutBooks from '../components/dashboard/CheckedOutBooks';
import OverdueBooks from '../components/dashboard/OverdueBooks';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PrivateRoute><MyLibrary /></PrivateRoute>} />
            <Route path="/add" element={<PrivateRoute><AddBook /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<PasswordResetRequest />} />
            <Route path="/reset/:token" element={<PasswordReset />} />
            <Route path="/teacher-checkout" element={<PrivateRoute><TeacherCheckout /></PrivateRoute>} />
            <Route path="/student-checkout" element={<StudentCheckout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library/*" element={<LibraryPage />} />
            <Route path="/manage/*" element={<Manage />} />
            <Route path="/checkout/*" element={<Checkout />} />
            <Route path="/checked-out-books" element={<PrivateRoute><CheckedOutBooks /></PrivateRoute>} />
            <Route path="/overdue-books" element={<PrivateRoute><OverdueBooks /></PrivateRoute>} />
        </Routes>
    );
};

export default AppRoutes;