// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';
import NavigationHandler from './auth/NavigationHandler';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NavigationHandler>
          <Header />
          <div className="container mx-auto p-4">
            <AppRoutes />
          </div>
        </NavigationHandler>
      </AuthProvider>
    </Router>
  );
};

export default App;
