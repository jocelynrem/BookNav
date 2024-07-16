import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MyLibrary from '../pages/MyLibrary';
import AddBook from '../components/search/AddBook';
import AddBookManual from '../pages/AddBookManual';
import AddBySearch from '../pages/AddBySearch';
import Login from '../auth/Login';
import Register from '../auth/Register';
import PasswordReset from '../auth/PasswordReset';
import PasswordResetRequest from '../auth/PasswordResetRequest';
import PrivateRoute from '../auth/PrivateRoute';
import ManageClasses from '../pages/ManageClasses';
import ManageStudents from '../pages/ManageStudents';
import TeacherCheckout from '../components/checkout/TeacherCheckout';
import StudentCheckout from '../components/checkout/StudentCheckout';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PrivateRoute><MyLibrary /></PrivateRoute>} />
            <Route path="/add" element={<PrivateRoute><AddBook /></PrivateRoute>} />
            <Route path="/add-manual" element={<PrivateRoute><AddBookManual /></PrivateRoute>} />
            <Route path="/add-search" element={<PrivateRoute><AddBySearch /></PrivateRoute>} />
            <Route path="/manage-classes" element={<PrivateRoute><ManageClasses /></PrivateRoute>} />
            <Route path="/manage-students" element={<PrivateRoute><ManageStudents /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<PasswordResetRequest />} />
            <Route path="/reset/:token" element={<PasswordReset />} />
            <Route path="/teacher-checkout" element={<PrivateRoute><TeacherCheckout /></PrivateRoute>} />
            <Route path="/student-checkout" element={<StudentCheckout />} />
        </Routes>
    );
};

export default AppRoutes;
