import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { operatingExpenses } from '../../data/mockData';
import { FONTS, SIZES } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import PanelFootnote from '../shared/PanelFootnote';

/* ── Editorial panel frame ─────────────────────────────── */

const panelFrame: React.CSSProperties = {
  padding: 0,
  height: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};


/* ── Bar constants ──────────────────────────────────── */

const BAR_WIDTH = 30;
const BAR_GAP_DESKTOP = 14;
const BAR_GAP_MOBILE = 10;
const MIN_BAR_FRACTION = 0.08;

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
          fontFamily: FONTS.data.family,
          fontSize: isMobile ? 13 : 11,
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: 5,
          flexShrink: 0,
          animationDelay: `${index * 0.1 + 0.4}s`,
          fontVariantNumeric: 'tabular-nums lining-nums',
          letterSpacing: '-0.005em',
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
            borderRadius: 0,
            background: 'var(--chart-gridline)',
          }}
        />
        <motion.div
          style={{
            width: BAR_WIDTH,
            height: `${heightFraction * 100}%`,
            borderRadius: 0, // square — editorial, not rounded
            background: color,
            opacity: hovered ? 1 : 0.88,
            cursor: 'pointer',
            transformOrigin: 'bottom',
            animation: `growUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
            position: 'relative',
            zIndex: 1,
          }}
          whileHover={{ scaleY: 1.04 }}
          transition={{ scaleY: { duration: 0.2 } }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
      </div>

      {/* X-axis label */}
      <span
        style={{
          fontFamily: FONTS.caption.family,
          fontSize: isMobile ? 10 : 9,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          marginTop: 6,
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
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <div
        style={{
          width: 2,
          height: isMobile ? 14 : 12,
          borderRadius: 0,
          background: color,
          flexShrink: 0,
          alignSelf: 'center',
        }}
      />
      <span
        style={{
          fontFamily: FONTS.caption.family,
          fontSize: isMobile ? 11 : 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          color: 'var(--text-secondary)',
          flex: 1,
        }}
      >
        {category}
      </span>
      <span
        style={{
          fontFamily: FONTS.data.family,
          fontSize: isMobile ? 13 : 11,
          fontWeight: 500,
          color: 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.005em',
        }}
      >
        {pct}%
      </span>
    </div>

    {/* Mini progress bar */}
    <div
      style={{
        height: 1,
        borderRadius: 0,
        background: 'var(--chart-gridline)',
        marginLeft: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${(pct / maxPct) * 100}%`,
          height: '100%',
          background: color,
          opacity: 0.85,
        }}
      />
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────── */

const OperatingExpenses: React.FC = () => {
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();
  const maxPct = Math.max(...operatingExpenses.breakdown.map((b) => b.pct));
  const barGap = isMobile ? BAR_GAP_MOBILE : BAR_GAP_DESKTOP;

  // Derive bar heights from actual quarter values (tallest = 1.0),
  // floor at MIN_BAR_FRACTION so sub-cent values remain visible.
  const maxQuarterValue = Math.max(
    ...operatingExpenses.quarters.map((q) => Math.abs(q.value)),
    0,
  );
  const heightFor = (value: number): number => {
    if (maxQuarterValue === 0) return MIN_BAR_FRACTION;
    const fraction = Math.abs(value) / maxQuarterValue;
    return Math.max(fraction, MIN_BAR_FRACTION);
  };

  return (
    <div style={panelFrame}>
      {/* Editorial title */}
      <div style={{ marginBottom: 14, flexShrink: 0 }}>
        <div
          style={{
            fontFamily: FONTS.serif.family,
            fontSize: isMobile ? SIZES.sectionTitleSm : SIZES.sectionTitle,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          Operating expenses
        </div>
        <div
          style={{
            fontFamily: FONTS.caption.family,
            fontSize: 9,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            marginTop: 3,
          }}
        >
          By quarter & category · ₹ Crores
        </div>
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
              heightFraction={heightFor(q.value)}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Hairline divider between chart and breakdown */}
        {isMobile ? (
          <div style={{ height: 1, background: 'var(--border-subtle)', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 1, background: 'var(--border-subtle)', flexShrink: 0 }} />
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

      <PanelFootnote
        notes={[
          'Quarterly totals = COGS + Indirect Expenses (Tally groups)',
          'Ledger splits are reference-level — shortfall to group total reflects year-end provisions (ESOP, audit, impairment)',
        ]}
      />
    </div>
  );
};

export default OperatingExpenses;
