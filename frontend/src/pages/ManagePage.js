import React from 'react';
import ClassStudentManager from '../components/manage/ClassStudentManager';
import Breadcrumbs from '../components/dashboard/Breadcrumbs';

const ManagePage = () => {
    const breadcrumbItems = [
        { name: 'Manage', href: '/manage' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Manage Classes and Students</h1>
            <ClassStudentManager />
        </div>
    );
};

export default ManagePage;