import React from 'react';
import { motion } from 'motion/react';

export default function BrandLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M50 5L90 25V75L50 95L10 75V25L50 5Z"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="15"
          fill="currentColor"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: "spring" }}
        />
        <motion.path
          d="M50 35V20M50 65V80M35 50H20M65 50H80"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        />
      </svg>
    </div>
  );
}
