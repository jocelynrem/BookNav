import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LibraryTabs from './tabs/LibraryTabs';
import MyLibrary from '../components/library/MyLibrary';
import AddBookManual from '../components/addBookFunction/AddBookManual';
import AddBySearch from '../components/addBookFunction/AddBySearch';
import Breadcrumbs from '../components/dashboard/Breadcrumbs';

const LibraryPage = () => {
    const location = useLocation();

    const getBreadcrumbItems = () => {
        const path = location.pathname;
        const items = [{ name: 'Library', href: '/library/my-library' }];

        if (path.includes('add-book')) {
            items.push({ name: 'Add Book', href: '/library/add-book/search' });
            if (path.includes('manual')) {
                items.push({ name: 'Manual Entry', href: '/library/add-book/manual' });
            } else if (path.includes('search')) {
                items.push({ name: 'Search', href: '/library/add-book/search' });
            }
        }

        return items;
    };

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 py-8">
                <Breadcrumbs items={getBreadcrumbItems()} />
            </div>
            <LibraryTabs />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                    <Route path="my-library" element={<MyLibrary />} />
                    <Route path="add-book/manual" element={<AddBookManual />} />
                    <Route path="add-book/search" element={<AddBySearch />} />
                    <Route path="*" element={<Navigate to="my-library" />} />
                </Routes>
            </div>
        </div>
    );
};

export default LibraryPage;