import React, { useState, useEffect } from 'react';
import { FONTS, SIZES } from '../../theme/typography';
import { financialAnalysis } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const glassCard: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 8,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '12px 16px',
  height: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
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

/* ── Donut Chart — P&L waterfall ───────────────────── */

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

  const total = financialAnalysis.donut.reduce((s, d) => s + d.value, 0);
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

  const size = isMobile ? 115 : 95;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = isMobile ? 48 : 40;
  const innerR = isMobile ? 33 : 27;
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
                  filter: `drop-shadow(0 0 ${isHov ? 10 : 4}px ${mapColor(seg.color)}4D)`,
                  transition: 'filter 0.2s ease',
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Center label — Net Profit */}
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
            fontFamily: FONTS.data.family,
            fontSize: isMobile ? 16 : 13,
            fontWeight: 700,
            color: mapColor('#FFD700'),
            lineHeight: 1,
            filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.3))',
          }}
        >
          ₹{financialAnalysis.donut[3].value.toFixed(2)} Cr
        </div>
        <div
          style={{
            fontFamily: FONTS.label.family,
            fontSize: isMobile ? 8 : 6,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: 1,
          }}
        >
          NET PROFIT
        </div>
      </div>
    </div>
  );
}

/* ── Expense category row with mini bar ────────────── */

interface ExpenseCatRowProps {
  category: string;
  pct: number;
  amount: number;
  color: string;
  maxPct: number;
  index: number;
  isMobile: boolean;
  mapColor: (c: string) => string;
}

function ExpenseCatRow({ category, pct, amount, color, maxPct, index, isMobile, mapColor }: ExpenseCatRowProps) {
  const mappedColor = mapColor(color);
  return (
    <div
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        animationDelay: `${index * 0.06}s`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            width: 2,
            height: isMobile ? 12 : 8,
            borderRadius: 1,
            background: mappedColor,
            boxShadow: `0 0 3px ${mappedColor}60`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: FONTS.body.family,
            fontSize: isMobile ? 10 : 7,
            color: 'var(--text-secondary)',
            flex: 1,
            lineHeight: 1.2,
          }}
        >
          {category}
        </span>
        <span
          style={{
            fontFamily: FONTS.data.family,
            fontSize: isMobile ? 10 : 8,
            fontWeight: 700,
            color: mappedColor,
          }}
        >
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 1.5,
          borderRadius: 1,
          background: 'var(--chart-gridline)',
          marginLeft: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${(pct / maxPct) * 100}%`,
            height: '100%',
            borderRadius: 1,
            background: `linear-gradient(90deg, ${mappedColor}, ${mappedColor}60)`,
            boxShadow: `0 0 4px ${mappedColor}40`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */

export default function FinancialAnalysis() {
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();
  const [isHovered, setIsHovered] = useState(false);

  const total = financialAnalysis.donut.reduce((s, d) => s + d.value, 0);
  const segments = financialAnalysis.donut.map((d) => ({
    ...d,
    percentage: Math.round((d.value / total) * 100),
  }));

  const { total: expTotal, label: expLabel, categories } = financialAnalysis.expenseComposition;
  const maxPct = Math.max(...categories.map((c) => c.pct));

  return (
    <div
      className="fade-in-up"
      style={{
        ...glassCard,
        ...(isMobile ? { padding: '16px' } : {}),
        borderColor: isHovered ? 'var(--hover-border)' : 'var(--border-card)',
        boxShadow: isHovered ? 'var(--hover-glow)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: FONTS.header.family,
          fontSize: isMobile ? 14 : SIZES.panelTitle,
          fontWeight: FONTS.header.weight,
          textTransform: FONTS.header.transform,
          letterSpacing: FONTS.header.letterSpacing,
          color: 'var(--text-primary)',
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        P&amp;L OVERVIEW
      </div>

      {/* Two-column layout: Donut + Legend | Expense Composition */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 10, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        {/* Left side: Donut + Legend stacked vertically */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: isMobile ? 10 : 10,
            flex: isMobile ? undefined : 1,
            minWidth: 0,
          }}
        >
          {/* Donut */}
          <DonutChart mapColor={mapColor} isMobile={isMobile} />

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              flexWrap: isMobile ? 'wrap' : undefined,
              justifyContent: 'center',
              gap: isMobile ? 10 : 6,
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
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: `linear-gradient(180deg, ${mapColor(seg.color)}, ${mapColor(seg.color)}60)`,
                    boxShadow: `0 0 4px ${mapColor(seg.color)}50`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: FONTS.body.family,
                      fontSize: isMobile ? 11 : 8,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.1,
                    }}
                  >
                    {seg.segment}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span
                      style={{
                        fontFamily: FONTS.data.family,
                        fontSize: isMobile ? 14 : 12,
                        fontWeight: 700,
                        color: mapColor(seg.color),
                        filter: `drop-shadow(0 0 4px ${mapColor(seg.color)}40)`,
                        lineHeight: 1,
                      }}
                    >
                      {formatCurrency(seg.value, seg.unit)}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.label.family,
                        fontSize: isMobile ? 10 : 7,
                        color: mapColor(seg.color),
                        opacity: 0.6,
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

        {/* Divider */}
        <div
          style={{
            width: isMobile ? '100%' : 1,
            height: isMobile ? 1 : undefined,
            background: `linear-gradient(${isMobile ? '90deg' : '180deg'}, transparent, var(--divider), transparent)`,
            flexShrink: 0,
          }}
        />

        {/* Right side: Expense Composition */}
        <div
          style={{
            flex: isMobile ? undefined : 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.label.family,
              fontSize: isMobile ? 11 : 8,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              flexShrink: 0,
            }}
          >
            {expLabel}
          </div>

          <div
            style={{
              fontFamily: FONTS.data.family,
              fontSize: isMobile ? 18 : 16,
              fontWeight: 700,
              color: mapColor(expTotal.color),
              filter: `drop-shadow(0 0 8px ${mapColor(expTotal.color)}50)`,
              lineHeight: 1,
              marginBottom: 2,
              flexShrink: 0,
            }}
          >
            {formatCurrency(expTotal.value, expTotal.unit, expTotal.currency)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {categories.map((cat, i) => (
              <ExpenseCatRow
                key={cat.category}
                category={cat.category}
                pct={cat.pct}
                amount={cat.amount}
                color={cat.color}
                maxPct={maxPct}
                index={i}
                isMobile={isMobile}
                mapColor={mapColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
