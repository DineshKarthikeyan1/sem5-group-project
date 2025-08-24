import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import authService from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'signup', 'dashboard'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        setCurrentPage('dashboard');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  const handleGoToSignUp = () => {
    setCurrentPage('signup');
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading VoiceFinance..." />;
  }

  return (
    <div className="App">
      {currentPage === 'dashboard' ? (
        <Dashboard onLogout={handleLogout} />
      ) : currentPage === 'signup' ? (
        <SignUpPage onSignUp={handleSignUp} onBackToLogin={handleBackToLogin} />
      ) : (
        <LoginPage onLogin={handleLogin} onGoToSignUp={handleGoToSignUp} />
      )}
    </div>
  );
}

export default App;
