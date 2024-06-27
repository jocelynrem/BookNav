import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MyLibrary from './components/MyLibrary';
import AddBook from './components/AddBook';
import AddBookManual from './components/AddBookManual';
import AddBySearch from './components/AddBySearch';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AuthCheck from './components/AuthCheck';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AuthCheck>
          <Header />
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<PrivateRoute><MyLibrary /></PrivateRoute>} />
              <Route path="/add" element={<PrivateRoute><AddBook /></PrivateRoute>} />
              <Route path="/add-manual" element={<PrivateRoute><AddBookManual /></PrivateRoute>} />
              <Route path="/add-search" element={<PrivateRoute><AddBySearch /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </AuthCheck>
      </AuthProvider>
    </Router>
  );
};

export default App;
