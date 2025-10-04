import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import Dashboard from "./components/Dashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
import SupabaseTest from "./components/SupabaseTest";
import VoiceDemo from "./components/VoiceDemo";
import DatabaseInspector from "./components/DatabaseInspector";
import SimpleVoiceTransaction from "./components/SimpleVoiceTransaction";
import VoiceTransactionDebugger from "./components/VoiceTransactionDebugger";
import ThemeToggle from "./components/ThemeToggle";

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState("login"); // 'login', 'signup', 'dashboard', 'demo', 'inspector', 'simple-voice', 'voice-debugger'
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
    return <LoadingSpinner message="Loading FinSay..." />;
  }

  // Show test component if requested
  if (showTest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 ml-8 mr-8">
          <button
            onClick={() => setShowTest(false)}
            className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Back to App
          </button>
          <ThemeToggle />
        </div>
        <SupabaseTest />
      </div>
    );
  }

  // Show voice demo if requested
  if (currentPage === "demo") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 ml-8 mr-8">
          <button
            onClick={() => setCurrentPage("login")}
            className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Back to Login
          </button>
          <ThemeToggle />
        </div>
        <VoiceDemo />
      </div>
    );
  }

  // Show database inspector if requested
  if (currentPage === "inspector") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 ml-8 mr-8">
          <button
            onClick={() => setCurrentPage("login")}
            className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Back to Login
          </button>
          <ThemeToggle />
        </div>
        <DatabaseInspector />
      </div>
    );
  }

  // Show simple voice transaction if requested
  if (currentPage === "simple-voice") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 ml-8 mr-8">
          <button
            onClick={() => setCurrentPage("login")}
            className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Back to Login
          </button>
          <ThemeToggle />
        </div>
        <SimpleVoiceTransaction />
      </div>
    );
  }

  // Show voice transaction debugger if requested
  if (currentPage === "voice-debugger") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 ml-8 mr-8">
          <button
            onClick={() => setCurrentPage("login")}
            className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Back to Login
          </button>
          <ThemeToggle />
        </div>
        <VoiceTransactionDebugger />
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // If not authenticated, show login/signup pages
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Debug, Demo, and Theme buttons */}
      <div className="fixed top-4 right-4 z-50 flex flex-wrap gap-2">
        <ThemeToggle size="sm" />
        <button
          onClick={() => setCurrentPage("simple-voice")}
          className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
        >
          🎤 Simple Voice
        </button>
        <button
          onClick={() => setCurrentPage("demo")}
          className="px-3 py-1 bg-green-500 dark:bg-green-600 text-white text-xs rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200"
        >
          Voice Demo
        </button>
        <button
          onClick={() => setCurrentPage("inspector")}
          className="px-3 py-1 bg-purple-500 dark:bg-purple-600 text-white text-xs rounded-md hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors duration-200"
        >
          DB Inspector
        </button>
        <button
          onClick={() => setCurrentPage("voice-debugger")}
          className="px-3 py-1 bg-orange-500 dark:bg-orange-600 text-white text-xs rounded-md hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors duration-200"
        >
          🎤 Debug
        </button>
        <button
          onClick={() => setShowTest(true)}
          className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white text-xs rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200"
        >
          DB Test
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
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
