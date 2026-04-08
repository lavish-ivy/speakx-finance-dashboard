import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { operatingExpenses } from '../../data/mockData';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';

/* ── Glass card ─────────────────────────────────────── */

const glassStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 8,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '14px 18px',
  height: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
};


/* ── Bar constants ──────────────────────────────────── */

const BAR_WIDTH = 30;
const BAR_GAP_DESKTOP = 14;
const BAR_GAP_MOBILE = 10;

const barMeta: Record<string, number> = {
  Q1: 0.66,
  Q2: 0.73,
  Q3: 0.80,
  Q4: 1.0,
};

/* ── growUp keyframes ───────────────────────────────── */

const growUpStyleId = 'grow-up-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(growUpStyleId)) {
  const style = document.createElement('style');
  style.id = growUpStyleId;
  style.textContent = `
    @keyframes growUp {
      from { transform: scaleY(0); }
      to   { transform: scaleY(1); }
    }
  `;
  document.head.appendChild(style);
}

/* ── Single bar ─────────────────────────────────────── */

const Bar: React.FC<{
  label: string;
  value: number;
  unit: string;
  color: string;
  heightFraction: number;
  index: number;
  isMobile?: boolean;
}> = ({ label, value, unit, color, heightFraction, index, isMobile = false }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: BAR_WIDTH,
        flex: '0 0 auto',
      }}
    >
      {/* Value label */}
      <span
        className="fade-in"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? 12 : 10,
          fontWeight: 700,
          color,
          marginBottom: 4,
          flexShrink: 0,
          animationDelay: `${index * 0.1 + 0.4}s`,
          filter: `drop-shadow(0 0 4px ${color}40)`,
        }}
      >
        {value.toFixed(1)}{unit}
      </span>

      {/* Bar area */}
      <div
        style={{
          width: BAR_WIDTH,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'flex-end',
          position: 'relative',
        }}
      >
        {/* Subtle background track */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '4px 4px 0 0',
            background: 'var(--chart-gridline)',
          }}
        />
        <motion.div
          style={{
            width: BAR_WIDTH,
            height: `${heightFraction * 100}%`,
            borderRadius: '4px 4px 0 0',
            background: `linear-gradient(to bottom, ${color}, ${color}30)`,
            filter: hovered
              ? `drop-shadow(0 0 14px ${color}90)`
              : `drop-shadow(0 0 6px ${color}4D)`,
            cursor: 'pointer',
            transformOrigin: 'bottom',
            animation: `growUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
            position: 'relative',
            zIndex: 1,
          }}
          whileHover={{ scaleY: 1.05 }}
          transition={{ scaleY: { duration: 0.2 } }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
      </div>

      {/* X-axis label */}
      <span
        style={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: isMobile ? 11 : 9,
          fontWeight: 400,
          color: 'var(--text-muted)',
          marginTop: 5,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
    </div>
  );
};

/* ── Breakdown row with mini progress bar ───────────── */

const BreakdownRow: React.FC<{
  category: string;
  pct: number;
  color: string;
  maxPct: number;
  index: number;
  isMobile?: boolean;
}> = ({ category, pct, color, maxPct, index, isMobile = false }) => (
  <div
    className="fade-in"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? 6 : 3,
      animationDelay: `${index * 0.08}s`,
    }}
  >
    {/* Label + percentage row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 3,
          height: isMobile ? 16 : 12,
          borderRadius: 1.5,
          background: color,
          boxShadow: `0 0 4px ${color}60`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? 12 : 9,
          fontWeight: 400,
          color: 'var(--text-secondary)',
          flex: 1,
        }}
      >
        {category}
      </span>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? 13 : 10,
          fontWeight: 700,
          color,
          filter: `drop-shadow(0 0 4px ${color}30)`,
        }}
      >
        {pct}%
      </span>
    </div>

    {/* Mini progress bar */}
    <div
      style={{
        height: isMobile ? 3 : 2,
        borderRadius: 1,
        background: 'var(--chart-gridline)',
        marginLeft: 9,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${(pct / maxPct) * 100}%`,
          height: '100%',
          borderRadius: 1,
          background: `linear-gradient(90deg, ${color}, ${color}60)`,
          boxShadow: `0 0 4px ${color}40`,
        }}
      />
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────── */

const OperatingExpenses: React.FC = () => {
  const { mapColor, isDark } = useTheme();
  const { isMobile } = useBreakpoint();
  const [isHovered, setIsHovered] = useState(false);
  const maxPct = Math.max(...operatingExpenses.breakdown.map((b) => b.pct));
  const barGap = isMobile ? BAR_GAP_MOBILE : BAR_GAP_DESKTOP;

  return (
    <div
      style={{
        ...glassStyle,
        padding: isMobile ? '16px' : '14px 18px',
        borderColor: isHovered ? 'var(--hover-border)' : 'var(--border-card)',
        boxShadow: isHovered ? 'var(--hover-glow)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: isMobile ? 14 : 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-primary)',
          marginBottom: 10,
          flexShrink: 0,
        }}
      >
        EXPENSES
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 14, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Bar chart */}
        <div
          style={{
            flex: isMobile ? undefined : 1,
            height: isMobile ? 140 : undefined,
            minWidth: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: barGap,
            alignItems: 'stretch',
          }}
        >
          {operatingExpenses.quarters.map((q, i) => (
            <Bar
              key={q.label}
              label={q.label}
              value={q.value}
              unit={q.unit}
              color={mapColor(q.color)}
              heightFraction={barMeta[q.label]}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Divider */}
        {isMobile ? (
          <div
            style={{
              height: 1,
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                : 'linear-gradient(90deg, transparent, var(--divider), transparent)',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 1,
              background: isDark
                ? 'linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)'
                : 'linear-gradient(180deg, transparent, var(--divider), transparent)',
              flexShrink: 0,
            }}
          />
        )}

        {/* Right: Breakdown with progress bars */}
        <div
          style={{
            flex: isMobile ? undefined : 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
          }}
        >
          {operatingExpenses.breakdown.map((item, i) => (
            <BreakdownRow
              key={item.category}
              category={item.category}
              pct={item.pct}
              color={mapColor(item.color)}
              maxPct={maxPct}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OperatingExpenses;
