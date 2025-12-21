import React from 'react';
import { motion } from 'framer-motion'
import { FiChevronLeft } from 'react-icons/fi'

const PrevBtn = ({ onClick, disabled = false, children = 'Prev' }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-200"
    >
      <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
      {children}
    </motion.button>
  );
}
export default PrevBtn;
