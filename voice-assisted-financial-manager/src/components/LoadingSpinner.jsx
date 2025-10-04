import React from "react";
import { Sparkles, Zap, Brain } from "lucide-react";

const LoadingSpinner = ({
  message = "Loading...",
  size = "large",
  variant = "default",
  showLogo = true,
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const iconSizes = {
    small: "w-3 h-3",
    medium: "w-4 h-4",
    large: "w-6 h-6",
    xl: "w-8 h-8",
  };

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center space-x-3 py-4">
        <div className="relative">
          <div
            className={`${sizeClasses[size]} border-3 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin`}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles
              className={`${iconSizes[size]} text-primary-600 dark:text-primary-400 animate-pulse`}
            />
          </div>
        </div>
        {message && (
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div
            className={`${sizeClasses[size]} border-3 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin`}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain
              className={`${iconSizes[size]} text-primary-600 dark:text-primary-400 animate-pulse`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Enhanced loading animation */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div className="w-24 h-24 border-4 border-primary-100 dark:border-primary-900 rounded-full animate-spin mx-auto"></div>
          {/* Middle ring */}
          <div className="absolute inset-2 w-20 h-20 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 dark:border-t-primary-400 rounded-full animate-spin"></div>
          {/* Inner ring */}
          <div
            className="absolute inset-4 w-16 h-16 border-4 border-primary-300 dark:border-primary-700 border-t-primary-600 dark:border-t-primary-300 rounded-full animate-spin"
            style={{ animationDirection: "reverse" }}
          ></div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 bg-primary-600 dark:bg-primary-500 rounded-full shadow-lg animate-pulse">
              <Sparkles className="w-8 h-8 text-white animate-float" />
            </div>
          </div>

          {/* Floating particles */}
          <div
            className="absolute -top-2 -right-2 w-3 h-3 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="absolute -bottom-2 -left-2 w-2 h-2 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="absolute top-1/2 -right-4 w-2 h-2 bg-primary-300 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Logo and branding */}
        {showLogo && (
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gradient-primary mb-2 animate-fade-in">
              FinSay
            </h1>
            <div className="flex items-center justify-center space-x-2 text-primary-600 dark:text-primary-400">
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">
                AI-Powered Financial Manager
              </span>
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        )}

        {/* Loading message */}
        <div className="space-y-3">
          <p className="text-xl font-semibold text-gray-900 dark:text-white animate-fade-in">
            {message}
          </p>

          {/* Loading dots */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>

          {/* Subtle description */}
          <p
            className="text-sm text-gray-500 dark:text-gray-400 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            Initializing your financial assistant...
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mt-8 w-full max-w-xs mx-auto">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
