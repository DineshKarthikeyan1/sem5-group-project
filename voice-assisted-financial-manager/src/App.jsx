import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import Dashboard from "./components/Dashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import SupabaseTest from "./components/SupabaseTest";
import VoiceDemo from "./components/VoiceDemo";

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState("login"); // 'login', 'signup', 'dashboard', 'demo'
  const [showTest, setShowTest] = useState(false);

  const handleLogin = () => {
    setCurrentPage("dashboard");
  };

  const handleSignUp = () => {
    setCurrentPage("dashboard");
  };

  const handleBackToLogin = () => {
    setCurrentPage("login");
  };

  const handleGoToSignUp = () => {
    setCurrentPage("signup");
  };

  if (loading) {
    return <LoadingSpinner message="Loading VoiceFinance..." />;
  }

  // Show test component if requested
  if (showTest) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <button
          onClick={() => setShowTest(false)}
          className="mb-4 ml-8 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Back to App
        </button>
        <SupabaseTest />
      </div>
    );
  }

  // Show voice demo if requested
  if (currentPage === "demo") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <button
          onClick={() => setCurrentPage("login")}
          className="mb-4 ml-8 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Back to Login
        </button>
        <VoiceDemo />
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // If not authenticated, show login/signup pages
  return (
    <div className="App">
      {/* Debug and Demo buttons */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        <button
          onClick={() => setCurrentPage("demo")}
          className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600"
        >
          Voice Demo
        </button>
        <button
          onClick={() => setShowTest(true)}
          className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
        >
          Debug
        </button>
      </div>

      {currentPage === "signup" ? (
        <SignUpPage onSignUp={handleSignUp} onBackToLogin={handleBackToLogin} />
      ) : (
        <LoginPage onLogin={handleLogin} onGoToSignUp={handleGoToSignUp} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
