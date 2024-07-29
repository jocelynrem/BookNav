import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';
import NavigationHandler from './auth/NavigationHandler';
import AppRoutes from './routes/AppRoutes';

const HeaderWrapper = () => {
  const location = useLocation();
  const isStudentMode = location.pathname.includes('/checkout') && location.search.includes('mode=student');

  return !isStudentMode ? <Header /> : null;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NavigationHandler>
          <HeaderWrapper />
          <AppRoutes />
        </NavigationHandler>
      </AuthProvider>
    </Router>
  );
};

export default App;