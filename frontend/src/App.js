import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import AddBookManual from './components/AddBookManual';
import AddBookISBN from './components/AddBookISBN';
import AddBySearch from './components/AddBySearch';

const App = () => {
  return (
    <Router>
      <Header />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/add" element={<AddBook />} />
          <Route path="/add-manual" element={<AddBookManual />} />
          <Route path="/add-isbn" element={<AddBookISBN />} />
          <Route path="/add-search" element={<AddBySearch />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
