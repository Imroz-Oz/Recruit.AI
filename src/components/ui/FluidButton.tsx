import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FluidButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  className?: string;
}

export function FluidButton({ children, variant = 'primary', className, ...props }: FluidButtonProps) {
  const variants = {
    primary: "bg-indigo-electric text-white shadow-lg shadow-indigo-electric/30 hover:shadow-indigo-electric/50",
    secondary: "bg-white text-indigo-electric border border-indigo-100 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100/50",
    glass: "bg-white/40 backdrop-blur-md border border-white/50 text-indigo-electric shadow-sm hover:bg-white/60"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm transition-all duration-300 relative overflow-hidden",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
