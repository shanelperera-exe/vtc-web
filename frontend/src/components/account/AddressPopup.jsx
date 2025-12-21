import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const AddressPopup = ({ isOpen = true, onClose, children, maxWidthClass = 'max-w-lg' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-sm p-0 cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.95, rotate: "6deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0.95, rotate: "0deg" }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidthClass} h-auto max-h-[90vh] overflow-hidden cursor-default rounded-2xl border border-black/10 bg-white shadow-xl shadow-black/10`}
          >
            <button
              onClick={onClose}
              aria-label="Close address popup"
              className="absolute right-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 transition hover:bg-neutral-100"
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            {/* content area scrolls if taller than the popup max height */}
            <div className="relative z-10 max-h-[calc(90vh-3rem)] overflow-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddressPopup;
