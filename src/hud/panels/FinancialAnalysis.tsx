import React, { useState, useEffect } from 'react';
import { FONTS, SIZES } from '../../theme/typography';
import { financialAnalysis } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import PanelFootnote from '../shared/PanelFootnote';

// Editorial panel frame (see MarginTrends.tsx for rationale)
const panelFrame: React.CSSProperties = {
  padding: 0,
  height: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

/* ── Donut geometry helpers ─────────────────────────── */

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

/* ── Donut Chart — P&L composition (Total Income reconciliation) ────
 *
 * Segments sum exactly to Total Income: COGS + OpEx + PBT = Rev + OtherIncome.
 * The previous version stacked Revenue / Total Expenses / Other Income /
 * Net Profit as pie slices, which was mathematically incoherent — those
 * values aren't parts of a whole. This version answers the honest question
 * "Where did every rupee of Total Income go?" with a clean reconciliation.
 */

function DonutChart({ mapColor, isMobile }: { mapColor: (c: string) => string; isMobile: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimProgress(eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, []);

  const total = financialAnalysis.total.value;
  const gapDeg = 4;
  const totalGap = gapDeg * financialAnalysis.donut.length;
  const available = 360 - totalGap;

  let currentAngle = 0;
  const segments = financialAnalysis.donut.map((d) => {
    const pct = d.value / total;
    const sweep = available * pct;
    const seg = {
      ...d,
      startAngle: currentAngle,
      endAngle: currentAngle + sweep,
      percentage: pct,
    };
    currentAngle += sweep + gapDeg;
    return seg;
  });

  const size = isMobile ? 115 : 120;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = isMobile ? 48 : 50;
  const innerR = isMobile ? 33 : 34;
  const midR = (outerR + innerR) / 2;
  const strokeW = outerR - innerR;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        {segments.map((seg, i) => {
          const animEnd = seg.startAngle + (seg.endAngle - seg.startAngle) * animProgress;
          const isHov = hovered === i;
          const midAngle = (seg.startAngle + seg.endAngle) / 2;
          const pushRad = ((midAngle - 90) * Math.PI) / 180;
          const pushDist = isHov ? 3 : 0;
          const tx = Math.cos(pushRad) * pushDist;
          const ty = Math.sin(pushRad) * pushDist;

          if (animEnd <= seg.startAngle) return null;

          return (
            <g
              key={i}
              transform={`translate(${tx}, ${ty})`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={describeArc(cx, cy, midR, seg.startAngle, animEnd)}
                fill="none"
                stroke={mapColor(seg.color)}
                strokeWidth={strokeW}
                strokeLinecap="butt"
                style={{
                  opacity: isHov ? 1 : 0.92,
                  transition: 'opacity 0.2s ease',
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Center label — Total Income (the sum of all segments) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.serif.family,
            fontSize: isMobile ? 18 : 18,
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums lining-nums',
          }}
        >
          ₹{financialAnalysis.total.value.toFixed(2)}
        </div>
        <div
          style={{
            fontFamily: FONTS.caption.family,
            fontSize: 8,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {financialAnalysis.total.label}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */

export default function FinancialAnalysis() {
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();

  const total = financialAnalysis.total.value;
  const segments = financialAnalysis.donut.map((d) => ({
    ...d,
    percentage: Math.round((d.value / total) * 100),
  }));

  return (
    <div className="fade-in-up" style={panelFrame}>
      {/* Editorial title + caption */}
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
          Where every rupee went
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
          Income composition · COGS + OpEx + PBT = Total Income
        </div>
      </div>

      {/* Donut + Legend side by side */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        {/* Donut */}
        <DonutChart mapColor={mapColor} isMobile={isMobile} />

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            flexWrap: isMobile ? 'wrap' : undefined,
            justifyContent: 'center',
            gap: isMobile ? 10 : 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          {segments.map((seg, i) => (
            <div
              key={i}
              className="fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                style={{
                  width: 2,
                  height: 22,
                  background: mapColor(seg.color),
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONTS.caption.family,
                    fontSize: isMobile ? 10 : 9,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--text-muted)',
                    lineHeight: 1.1,
                    marginBottom: 3,
                  }}
                >
                  {seg.segment}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: FONTS.data.family,
                      fontSize: isMobile ? 16 : 14,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums lining-nums',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {formatCurrency(seg.value, seg.unit)}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.sans.family,
                      fontSize: isMobile ? 11 : 10,
                      color: 'var(--text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {seg.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PanelFootnote
        notes={[
          'Segments sum exactly to Total Income (Revenue + Other Income)',
          'PBT is Tally-booked, pre-tax — income tax posted at year-end audit close',
          'Direct Costs = COGS · Operating Expenses = Indirect Expenses (Tally groups)',
        ]}
      />
    </div>
  );
}
