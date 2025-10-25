import React from 'react'

export default function Field({ label, id, children, required, className = '', error }) {
  return (
    <label htmlFor={id} className={`block text-sm font-medium text-gray-700 ${className}`}>
      {label}
      {required && <span className="ml-1 text-rose-600">*</span>}
      <div className="mt-1">{children}</div>
      {error && (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      )}
    </label>
  )
}
