import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Option = ({ label, onClick, disabled = false, title }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => { if (!disabled) onClick(); }}
      title={title}
      className={`w-full px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors border-b last:border-b-0 border-gray-200 flex items-center gap-2 ${disabled ? 'text-slate-300 cursor-not-allowed bg-gray-50' : 'text-slate-700 cursor-pointer hover:bg-gray-100 hover:text-black'}`}
    >
      {typeof label === 'string' ? <span>{label}</span> : label}
    </motion.li>
  );
};

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.06,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
    },
  },
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      when: 'afterChildren',
    },
  },
};

const Dropdown = ({ value, onChange, options = [], className = '', tall = false }) => {
  const [open, setOpen] = useState(false);
  const selectedOpt = (options.find((o) => String(o.value) === String(value)) || {});
  const selectedLabel = selectedOpt.label || value || '';

  return (
    <div className="relative">
      <motion.div animate={open ? 'open' : 'closed'} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          type="button"
          className={`flex items-center gap-2 px-3 ${tall ? 'h-10' : 'h-7'} text-gray-700 bg-white border border-gray-300 w-full justify-between rounded-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black ${open ? 'border-b-0 rounded-b-none' : ''} ${className}`}
        >
          <span className="flex-1 text-left truncate flex items-center gap-2">{typeof selectedLabel === 'string' ? <span className="truncate">{selectedLabel}</span> : selectedLabel}</span>
          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: 'top' }}
          className="flex flex-col gap-0 p-1 bg-white shadow-xl absolute top-full left-0 w-full border-2 border-gray-300 border-t-0 overflow-hidden z-50 rounded-t-none translate-y-[1px]"
        >
          {options.map((opt) => (
            <Option
              key={opt.value ?? opt.label}
              label={opt.label}
              disabled={opt.disabled}
              title={opt.title}
              onClick={() => { if (opt.disabled) return; onChange(opt.value ?? opt.label); setOpen(false); }}
            />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

export default Dropdown;
