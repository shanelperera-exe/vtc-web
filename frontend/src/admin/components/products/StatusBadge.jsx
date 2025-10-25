import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function StatusBadge({ status, compact = false }) {
  const isActive = status === 'active';
  const bg = isActive ? 'bg-green-100' : 'bg-red-100';
  const txt = isActive ? 'text-green-800' : 'text-red-800';
  const sizeClasses = compact ? 'text-[0.65rem] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const iconSizeClass = compact ? 'w-3 h-3 mr-1' : 'w-3.5 h-3.5 mr-1';
  return (
    <span className={`${bg} ${txt} inline-flex items-center ${sizeClasses} font-semibold rounded-full`}>
      {isActive ? (
        <>
          <FiCheckCircle className={iconSizeClass} /> {compact ? 'Active' : 'Active'}
        </>
      ) : (
        <>
          <FiXCircle className={iconSizeClass} /> {compact ? 'Inactive' : 'Inactive'}
        </>
      )}
    </span>
  );
}
