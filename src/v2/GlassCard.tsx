import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  style?: CSSProperties;
}

export default function GlassCard({ children, style }: GlassCardProps) {
  return (
    <motion.div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: 12,
        boxSizing: 'border-box',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
    >
      {children}
    </motion.div>
  );
}
