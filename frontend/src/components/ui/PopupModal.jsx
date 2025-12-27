import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const PopupModal = ({ isOpen = true, onClose, children, maxWidthClass = 'max-w-lg' }) => {
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
            className={`relative w-full ${maxWidthClass} h-auto max-h-[90vh] overflow-hidden cursor-default bg-white rounded-xl`}
          >
            <button
              onClick={onClose}
              aria-label="Close address popup"
              className="absolute top-1 right-1 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full text-neutral-900 transition"
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 md:h-8 md:w-8"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            {/* content area scrolls if taller than the popup max height */}
            <div className="relative z-10 p-6 overflow-auto max-h-[calc(90vh-3rem)]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupModal;
