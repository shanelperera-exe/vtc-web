import React from 'react';

/**
 * StatusPill
 * Props:
 *  - status: 'in stock' | 'out of stock' | null
 */
export default function StatusPill({ status }) {
  if (!status) return null;

  const isInStock = status === 'in stock';
  const bg = isInStock ? 'bg-green-100' : 'bg-red-100';
  const text = isInStock ? 'text-green-800' : 'text-red-800';

  return (
    <span className={`${bg} ${text} inline-flex items-center text-xs font-semibold ml-2 mr-2 px-2.5 py-1 rounded-full`}> 
      {/* icon */}
      {isInStock ? (
        <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.707a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293A1 1 0 006.293 7.707L8.586 10l-2.293 2.293a1 1 0 101.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clipRule="evenodd" />
        </svg>
      )}
      {isInStock ? 'In Stock' : 'Out of Stock'}
    </span>
  );
}
