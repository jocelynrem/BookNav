import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import LibraryTabs from './tabs/LibraryTabs';
import MyLibrary from '../components/library/MyLibrary';
import AddBookManual from '../components/addBookFunction/AddBookManual';
import AddBySearch from '../components/addBookFunction/AddBySearch';

const LibraryPage = () => {
    return (
        <div>
            <LibraryTabs />
            <div className="p-4 sm:p-6 lg:p-8">
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
