import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export function GlassCard({ children, className, intensity = 'medium', ...props }: GlassCardProps) {
  const intensities = {
    light: "bg-white/40 backdrop-blur-md border-white/40 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)]",
    medium: "bg-white/60 backdrop-blur-xl border-white/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]",
    heavy: "bg-white/80 backdrop-blur-2xl border-white/80 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.12)]"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-[2rem] border overflow-hidden",
        intensities[intensity],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
