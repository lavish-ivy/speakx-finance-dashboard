import { NavLink } from 'react-router-dom';
import { useDashboard, type Period } from '../context/DashboardContext';
import { FONTS } from '../theme/typography';

/**
 * Editorial footer ribbon.
 *
 * Replaces the neon-cyan glow pill/tab navigation with a thin editorial
 * strip pinned to the bottom of the viewport. Links are small-caps with
 * tracking; the active section is marked by a top rule, not a glowing
 * background. Period selector and mask toggle live in the same row as
 * subordinate controls.
 */

const links = [
  { to: '/',               label: 'Overview' },
  { to: '/pnl',            label: 'P&L' },
  { to: '/balance-sheet',  label: 'Balance Sheet' },
  { to: '/cash',           label: 'Cash' },
];

const periods: Period[] = ['M', 'Q', 'A'];
const periodLabels: Record<Period, string> = { M: 'Monthly', Q: 'Quarterly', A: 'Annual' };

function PeriodSelector() {
  const { period, setPeriod } = useDashboard();
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span
        style={{
          fontFamily: FONTS.caption.family,
          fontSize: 9,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--text-muted)',
        }}
      >
        View
      </span>
      {periods.map((p) => {
        const isActive = period === p;
        return (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            title={periodLabels[p]}
            style={{
              fontFamily: FONTS.caption.family,
              fontSize: 9,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              padding: '2px 0',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: isActive ? '1px solid var(--text-primary)' : '1px solid transparent',
              transition: 'color 0.2s ease, border-color 0.2s ease',
            }}
          >
            {p}
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
        fontFamily: FONTS.caption.family,
        fontSize: 9,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        padding: '2px 0',
        border: 'none',
        background: 'transparent',
        color: masked ? 'var(--accent-coral)' : 'var(--text-muted)',
        borderBottom: masked ? '1px solid var(--accent-coral)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {masked ? 'Values hidden' : 'Values shown'}
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
        justifyContent: 'space-between',
        gap: 20,
        padding: '12px 44px',
        background: 'var(--bg-deep)',
        borderTop: '1px solid var(--border-card)',
      }}
    >
      {/* Section nav */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
        <span
          style={{
            fontFamily: FONTS.caption.family,
            fontSize: 9,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
          }}
        >
          Sections
        </span>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              fontFamily: FONTS.caption.family,
              fontSize: 10,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              textDecoration: 'none',
              padding: '2px 0',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderTop: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
              paddingTop: 6,
              transition: 'color 0.2s ease, border-color 0.2s ease',
              whiteSpace: 'nowrap',
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
        <MaskToggle />
        <PeriodSelector />
      </div>
    </nav>
  );
}
