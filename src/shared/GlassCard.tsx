import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
}

export default function GlassCard({ children, style, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 10,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: 14,
        boxSizing: 'border-box',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
