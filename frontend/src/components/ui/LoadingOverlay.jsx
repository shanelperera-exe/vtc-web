import React from 'react';
import { useAuth } from '../../context/AuthContext';

const LoadingOverlay = () => {
  const { loading } = useAuth() || {};
  if (!loading) return null;
  return (
    <div role="status" aria-live="polite" aria-label="Loading authentication state" className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm font-medium text-emerald-700">Preparing your experience...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
