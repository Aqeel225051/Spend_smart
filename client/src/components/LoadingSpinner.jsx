import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium tracking-wide text-slate-500">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
