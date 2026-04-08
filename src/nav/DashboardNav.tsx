import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDashboard, type Period } from '../context/DashboardContext';

const links = [
  { to: '/',               label: 'OVERVIEW' },
  { to: '/pnl',            label: 'P&L' },
  { to: '/balance-sheet',  label: 'BALANCE SHEET' },
  { to: '/cash',           label: 'CASH' },
  { to: '/trends',         label: 'TRENDS' },
];

const periods: Period[] = ['M', 'Q', 'A'];
const periodLabels: Record<Period, string> = { M: 'M', Q: 'Q', A: 'A' };

function PeriodPill() {
  const { period, setPeriod } = useDashboard();

  return (
    <div style={{
      display: 'flex',
      borderRadius: 6,
      border: '1px solid rgba(0,255,204,0.15)',
      background: 'rgba(0,255,204,0.04)',
      overflow: 'hidden',
    }}>
      {periods.map((p) => {
        const isActive = period === p;
        return (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              position: 'relative',
              fontFamily: "'Orbitron', monospace",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '5px 10px',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#0A0C12' : 'rgba(0,255,204,0.5)',
              background: 'transparent',
              zIndex: 1,
              transition: 'color 0.2s ease',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="period-pill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 4,
                  background: '#00FFCC',
                  boxShadow: '0 0 12px rgba(0,255,204,0.4), 0 0 24px rgba(0,255,204,0.15)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {periodLabels[p]}
          </button>
        );
      })}
    </div>
  );
}

function MaskToggle() {
  const { masked, setMasked } = useDashboard();

  return (
    <button
      onClick={() => setMasked(!masked)}
      title={masked ? 'Show values' : 'Hide values'}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        padding: '4px 8px',
        borderRadius: 6,
        border: masked
          ? '1px solid rgba(255,69,58,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        background: masked
          ? 'rgba(255,69,58,0.12)'
          : 'rgba(255,255,255,0.04)',
        color: masked ? '#FF453A' : 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        lineHeight: 1,
      }}
    >
      {masked ? '🔒' : '👁'}
    </button>
  );
}

export default function DashboardNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '8px 12px',
        background: 'rgba(10, 12, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <MaskToggle />

      <div style={{ display: 'flex', gap: 2 }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              fontFamily: "'Orbitron', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 4,
              color: isActive ? '#00FFCC' : 'rgba(255,255,255,0.45)',
              background: isActive ? 'rgba(0,255,204,0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(0,255,204,0.2)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <PeriodPill />
    </nav>
  );
}
