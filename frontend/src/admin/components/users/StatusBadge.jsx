import React from 'react';
import { FiCheckCircle, FiSlash } from 'react-icons/fi';

const map = {
  active: { cls: 'bg-emerald-100 text-emerald-700', border: 'border border-emerald-300', Icon: FiCheckCircle },
  disabled: { cls: 'bg-rose-100 text-rose-700', border: 'border border-rose-300', Icon: FiSlash },
  pending: { cls: 'bg-amber-100 text-amber-700', border: 'border border-amber-300', Icon: FiCheckCircle }
};

export default function StatusBadge({ status }) {
  const entry = map[status] || { cls: 'bg-gray-100 text-gray-700', Icon: FiCheckCircle };
  const Icon = entry.Icon;
  return (
    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold capitalize ${entry.cls} ${entry.border || ''}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="leading-none">{status}</span>
    </span>
  );
}
