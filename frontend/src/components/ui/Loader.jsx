import React from 'react';

const Loader = ({ inline = false, message = 'Loading...' }) => (
  <div className={inline ? 'inline-flex items-center gap-2 text-sm text-gray-500' : 'w-full py-8 flex flex-col items-center justify-center text-gray-500'}>
    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span>{message}</span>
  </div>
);

export default Loader;
