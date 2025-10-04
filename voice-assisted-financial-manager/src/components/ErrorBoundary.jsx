import React from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-error-100 dark:bg-error-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                <AlertTriangle className="w-10 h-10 text-error-600 dark:text-error-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>
            </div>

            {/* Error Card */}
            <div className="card p-6 mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <Bug className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Error Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Error ID:{" "}
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {this.state.errorId}
                    </code>
                  </p>
                  {process.env.NODE_ENV === "development" &&
                    this.state.error && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300">
                          Show technical details
                        </summary>
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-32">
                            {this.state.error.toString()}
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      </details>
                    )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="btn-primary w-full h-12 text-base font-semibold"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="btn-secondary w-full h-12 text-base font-semibold"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                If this problem persists, please contact support
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
                <span>support@finsay.app</span>
                <span>•</span>
                <span>Error ID: {this.state.errorId}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
