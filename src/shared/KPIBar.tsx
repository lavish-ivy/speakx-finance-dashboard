import { motion } from 'framer-motion';
import { useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

export interface KPIItem {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}

interface KPIBarProps {
  items: KPIItem[];
}

export default function KPIBar({ items }: KPIBarProps) {
  const mask = useMaskedValue();
  const { isMobile } = useBreakpoint();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile
        ? 'repeat(2, 1fr)'
        : `repeat(${Math.min(items.length, 6)}, 1fr)`,
      gap: 8,
      marginBottom: 14,
    }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 8,
            padding: '10px 12px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 8,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            {item.label}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: item.negative
              ? '#FF453A'
              : item.positive
                ? '#00FFCC'
                : 'var(--text-primary)',
            textShadow: item.positive
              ? '0 0 12px rgba(0,255,204,0.3)'
              : item.negative
                ? '0 0 12px rgba(255,69,58,0.3)'
                : 'none',
          }}>
            {mask(item.value)}
          </div>
          {item.sub && (
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 9,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 2,
            }}>
              {mask(item.sub)}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
