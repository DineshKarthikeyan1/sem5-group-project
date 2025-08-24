import React from 'react';
import { Mic } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Mic className="w-6 h-6 text-primary-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">VoiceFinance</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
