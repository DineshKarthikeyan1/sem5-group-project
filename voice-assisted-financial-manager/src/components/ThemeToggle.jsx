import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = ({ size = "md", className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "w-12 h-6",
    md: "w-14 h-7",
    lg: "w-16 h-8",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        ${sizeClasses[size]}
        bg-gray-200 dark:bg-gray-700
        rounded-full
        transition-all duration-300 ease-in-out
        hover:bg-gray-300 dark:hover:bg-gray-600
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        group
        ${className}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-600 dark:to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

      {/* Slider */}
      <div
        className={`
          absolute top-0.5 left-0.5
          ${size === "sm" ? "w-5 h-5" : size === "md" ? "w-6 h-6" : "w-7 h-7"}
          bg-white dark:bg-gray-800
          rounded-full
          shadow-lg
          transform transition-all duration-300 ease-in-out
          flex items-center justify-center
          ${isDark ? "translate-x-full" : "translate-x-0"}
          group-hover:scale-110
        `}
      >
        {/* Icons with smooth transition */}
        <div className="relative">
          <Sun
            className={`
              ${iconSizes[size]}
              text-yellow-500
              absolute inset-0
              transition-all duration-300 ease-in-out
              ${
                isDark
                  ? "opacity-0 rotate-180 scale-0"
                  : "opacity-100 rotate-0 scale-100"
              }
            `}
          />
          <Moon
            className={`
              ${iconSizes[size]}
              text-blue-600
              absolute inset-0
              transition-all duration-300 ease-in-out
              ${
                isDark
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-180 scale-0"
              }
            `}
          />
        </div>
      </div>

      {/* Background glow effect */}
      <div
        className={`
          absolute inset-0 rounded-full
          transition-all duration-300 ease-in-out
          ${
            isDark
              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
              : "bg-gradient-to-r from-yellow-400/20 to-orange-500/20"
          }
          opacity-0 group-hover:opacity-100
        `}
      />
    </button>
  );
};

export default ThemeToggle;
