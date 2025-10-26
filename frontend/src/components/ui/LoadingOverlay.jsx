import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Lottie from 'lottie-react';
import shoppingCart from '../../assets/animations/shoppingCart.json';
import { motion } from 'framer-motion';

const LoadingOverlay = () => {
  const { loading } = useAuth() || {};
  if (!loading) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading authentication state"
      className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3">
        <Lottie
          aria-hidden="true"
          animationData={shoppingCart}
          loop
          autoplay
          className="h-30 w-30 sm:h-30 sm:w-30"
        />
        <p className="text-md font-medium text-black inline-flex items-center">
          Preparing your experience
          <span className="inline-flex items-center ml-2" aria-hidden="true">
            <motion.span
              className="mx-0.5"
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0 }}
            >
              .
            </motion.span>
            <motion.span
              className="mx-0.5"
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            >
              .
            </motion.span>
            <motion.span
              className="mx-0.5"
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            >
              .
            </motion.span>
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
