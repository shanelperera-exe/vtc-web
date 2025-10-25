import React from 'react';
import { FiShield, FiUser, FiStar } from 'react-icons/fi';

export default function RoleBadge({ role }) {
  const isManager = role === 'manager';
  const isAdmin = role === 'admin';
  let base = 'bg-emerald-100 text-emerald-700';
  let Icon = FiUser;
  let border = 'border border-emerald-300';
  if (isAdmin) {
    base = 'bg-purple-100 text-purple-700';
    border = 'border border-purple-300';
    Icon = FiShield;
  }
  if (isManager) {
    base = 'bg-amber-100 text-amber-700';
    border = 'border border-amber-300';
    Icon = FiStar;
  }
  return (
    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${base} ${border}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="leading-none">{role}</span>
    </span>
  );
}
