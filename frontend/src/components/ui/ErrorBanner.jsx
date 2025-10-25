import React from 'react';

const ErrorBanner = ({ error, onRetry }) => {
  if (!error) return null;
  return (
    <div className="w-full p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm flex items-center justify-between gap-4">
      <div className="flex-1">{error.message || 'Something went wrong'}</div>
      {onRetry && <button onClick={onRetry} className="px-3 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-500">Retry</button>}
    </div>
  );
};

export default ErrorBanner;
