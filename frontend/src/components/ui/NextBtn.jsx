import React from 'react';
import { motion } from 'framer-motion'
import { FiChevronRight } from 'react-icons/fi'

const NxtButton = ({ onClick, disabled = false, children = 'Next' }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-200"
    >
      {children}
      <FiChevronRight className="h-5 w-5" aria-hidden="true" />
    </motion.button>
  );
}
export default NxtButton;
