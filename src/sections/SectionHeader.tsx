import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
      <span
        style={{
          fontFamily: "'Orbitron', monospace",
          fontWeight: 700,
          fontSize: 16,
          color: 'var(--text-primary)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </span>
      <motion.div
        style={{
          width: 60,
          height: 1,
          backgroundColor: '#00FFCC',
          marginTop: 6,
          boxShadow: '0 0 8px rgba(0, 255, 204, 0.4)',
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
