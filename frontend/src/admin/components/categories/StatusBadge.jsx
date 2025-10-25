import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function StatusBadge({ status }) {
  const isActive = status === 'active';
  const bg = isActive ? 'bg-green-100' : 'bg-red-100';
  const txt = isActive ? 'text-green-800' : 'text-red-800';
  return (
    <span className={`${bg} ${txt} inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full`}>
      {isActive ? (
        <>
          <FiCheckCircle className="w-3.5 h-3.5 mr-1" /> Active
        </>
      ) : (
        <>
          <FiXCircle className="w-3.5 h-3.5 mr-1" /> Inactive
        </>
      )}
    </span>
  );
}
