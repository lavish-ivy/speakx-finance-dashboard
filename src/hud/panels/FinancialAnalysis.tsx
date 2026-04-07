import React, { useState, useEffect, useId } from 'react';
import { COLORS } from '../../theme/colors';
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
  padding: '16px 20px',
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

/* ── Donut Chart with center label ──────────────────── */

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

  const size = 115;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 48;
  const innerR = 33;
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
          const pushDist = isHov ? 4 : 0;
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

      {/* Center label */}
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
            fontSize: isMobile ? 22 : 20,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.2))',
          }}
        >
          ₹{total.toFixed(1)} Cr
        </div>
        <div
          style={{
            fontFamily: FONTS.label.family,
            fontSize: isMobile ? 11 : 7,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: 2,
          }}
        >
          TOTAL
        </div>
      </div>
    </div>
  );
}

/* ── Mini Sparkline ─────────────────────────────────── */

function MiniSparkline({ mapColor, height = 24 }: { mapColor: (c: string) => string; height?: number }) {
  const id = useId();
  const { sparkline } = financialAnalysis.revenueComposition;
  const w = 140;
  const h = height;
  const padY = 2;

  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;

  const points = sparkline.map((v, i) => ({
    x: (i / (sparkline.length - 1)) * w,
    y: h - padY - ((v - min) / range) * (h - padY * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sparkFill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mapColor(COLORS.cyan)} stopOpacity={0.25} />
          <stop offset="100%" stopColor={mapColor(COLORS.cyan)} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkFill-${id})`} />
      <path d={linePath} fill="none" stroke={mapColor(COLORS.cyan)} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
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

  const { total: revTotal, label: revLabel, split } = financialAnalysis.revenueComposition;

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
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        FINANCIAL ANALYSIS &amp; PROJECTIONS
      </div>

      {/* 3-column layout: Donut | Legend | Revenue Composition */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden', alignItems: isMobile ? 'center' : undefined }}>
        {/* Col 1: Donut chart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : undefined, flexShrink: 0, ...(isMobile ? { alignSelf: 'center' } : {}) }}>
          <DonutChart mapColor={mapColor} isMobile={isMobile} />
        </div>

        {/* Col 2: Legend items */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            flexWrap: isMobile ? 'wrap' : undefined,
            justifyContent: 'center',
            gap: isMobile ? 12 : 10,
          }}
        >
          {segments.map((seg, i) => (
            <div
              key={i}
              className="fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${mapColor(seg.color)}, ${mapColor(seg.color)}60)`,
                  boxShadow: `0 0 6px ${mapColor(seg.color)}50`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONTS.body.family,
                    fontSize: isMobile ? 12 : 10,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.2,
                    marginBottom: 2,
                  }}
                >
                  {seg.segment}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: FONTS.data.family,
                      fontSize: isMobile ? 15 : 15,
                      fontWeight: 700,
                      color: mapColor(seg.color),
                      filter: `drop-shadow(0 0 6px ${mapColor(seg.color)}40)`,
                      lineHeight: 1,
                    }}
                  >
                    {formatCurrency(seg.value, seg.unit)}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.label.family,
                      fontSize: isMobile ? 11 : 8,
                      color: mapColor(seg.color),
                      opacity: 0.6,
                      background: `${mapColor(seg.color)}12`,
                      padding: '1px 5px',
                      borderRadius: 3,
                    }}
                  >
                    {seg.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: isMobile ? '100%' : 1,
            height: isMobile ? 1 : undefined,
            background: `linear-gradient(${isMobile ? '90deg' : '180deg'}, transparent, var(--divider), transparent)`,
            flexShrink: 0,
          }}
        />

        {/* Col 3: Revenue Composition */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.label.family,
              fontSize: isMobile ? 12 : 9,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Revenue Composition
          </div>

          <div
            style={{
              fontFamily: FONTS.data.family,
              fontSize: isMobile ? 20 : 22,
              fontWeight: 700,
              color: mapColor(COLORS.cyan),
              filter: `drop-shadow(0 0 10px ${mapColor(COLORS.cyan)}50)`,
              lineHeight: 1,
            }}
          >
            {formatCurrency(revTotal.value, revTotal.unit, revTotal.currency)}
          </div>

          <div
            style={{
              fontFamily: FONTS.body.family,
              fontSize: isMobile ? 11 : 9,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {revLabel}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {split.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: mapColor(s.color),
                    boxShadow: `0 0 6px ${mapColor(s.color)}80`,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONTS.data.family,
                    fontSize: isMobile ? 12 : 11,
                    color: mapColor(s.color),
                    fontWeight: 700,
                  }}
                >
                  {s.type} {s.pct}%
                </span>
              </div>
            ))}
          </div>

          <MiniSparkline mapColor={mapColor} height={isMobile ? 36 : 24} />
        </div>
      </div>
    </div>
  );
}
