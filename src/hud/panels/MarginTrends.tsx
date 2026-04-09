import React, { useState, useEffect } from 'react';
import { FONTS, SIZES } from '../../theme/typography';
import { marginTrends } from '../../data/mockData';
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

interface TooltipData {
  x: number;
  y: number;
  value: number;
  month: string;
  color: string;
  seriesName: string;
}

/* Y-axis range for absolute ₹ Cr values */
const CHART = {
  width: 500,
  height: 200,
  padLeft: 36,
  padRight: 8,
  padTop: 10,
  padBottom: 24,
  yMin: -3,
  yMax: 7,
  yStep: 1,
};

function getChartX(i: number, count: number): number {
  return CHART.padLeft + (i / (count - 1)) * (CHART.width - CHART.padLeft - CHART.padRight);
}

function getChartY(val: number): number {
  const range = CHART.yMax - CHART.yMin;
  const plotH = CHART.height - CHART.padTop - CHART.padBottom;
  return CHART.padTop + plotH - ((val - CHART.yMin) / range) * plotH;
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function buildAreaPath(points: { x: number; y: number }[]): string {
  const linePath = buildSmoothPath(points);
  if (!linePath) return '';
  const zeroY = getChartY(0);
  return `${linePath} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`;
}

export default function MarginTrends() {
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimProgress(eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, []);

  const { months, series } = marginTrends;

  /* Show gridlines at every 2 Cr for readability (skip every-1 to avoid clutter) */
  const yTicks: number[] = [];
  for (let v = CHART.yMin; v <= CHART.yMax; v += 2) {
    yTicks.push(v);
  }

  const seriesPoints = series.map((s) =>
    s.data.map((val, i) => ({
      x: getChartX(i, months.length),
      y: getChartY(val),
      value: val,
    }))
  );

  return (
    <div
      className="fade-in-up"
      style={{
        ...glassCard,
        ...(isMobile ? { padding: '16px' } : {}),
        borderColor: isHovered ? 'var(--hover-border)' : 'var(--border-card)',
        boxShadow: isHovered ? 'var(--hover-glow)' : 'none',
        animationDelay: '0.1s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.header.family,
            fontSize: isMobile ? 14 : SIZES.panelTitle,
            fontWeight: FONTS.header.weight,
            textTransform: FONTS.header.transform,
            letterSpacing: FONTS.header.letterSpacing,
            color: 'var(--text-primary)',
          }}
        >
          REVENUE vs EXPENSES
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 8, flexWrap: isMobile ? 'wrap' : undefined }}>
          {series.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: mapColor(s.color),
                  boxShadow: `0 0 3px ${mapColor(s.color)}`,
                }}
              />
              <span
                style={{
                  fontFamily: FONTS.body.family,
                  fontSize: isMobile ? 11 : 7,
                  color: 'var(--text-secondary)',
                }}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', flex: 1, minHeight: isMobile ? 180 : 0, overflow: 'hidden' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            {series.map((s, i) => (
              <linearGradient key={i} id={`areaGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mapColor(s.color)} stopOpacity={0.08} />
                <stop offset="100%" stopColor={mapColor(s.color)} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal gridlines */}
          {yTicks.map((v) => {
            const y = getChartY(v);
            return (
              <g key={v}>
                <line
                  x1={CHART.padLeft}
                  y1={y}
                  x2={CHART.width - CHART.padRight}
                  y2={y}
                  strokeDasharray={v === 0 ? undefined : '4 3'}
                  strokeWidth={v === 0 ? 1.2 : 1}
                  style={{ stroke: v === 0 ? 'var(--text-muted)' : 'var(--chart-gridline)' }}
                  opacity={v === 0 ? 0.5 : 1}
                />
                <text
                  x={CHART.padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  style={{
                    fontFamily: FONTS.label.family,
                    fontSize: isMobile ? 9 : 7,
                    fill: 'var(--text-muted)',
                  }}
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {months.map((m, i) => (
            <text
              key={i}
              x={getChartX(i, months.length)}
              y={CHART.height - 4}
              textAnchor="middle"
              style={{
                fontFamily: FONTS.label.family,
                fontSize: isMobile ? 9 : 7,
                fill: 'var(--text-muted)',
              }}
            >
              {m}
            </text>
          ))}

          {/* Area fills (only for Revenue and Expenses, skip Net Profit) */}
          {seriesPoints.slice(0, 2).map((pts, i) => {
            const visibleCount = Math.ceil(pts.length * animProgress);
            const visiblePts = pts.slice(0, visibleCount);
            if (visiblePts.length < 2) return null;
            return (
              <path
                key={`area-${i}`}
                d={buildAreaPath(visiblePts)}
                fill={`url(#areaGrad${i})`}
              />
            );
          })}

          {/* Lines */}
          {seriesPoints.map((pts, i) => {
            const visibleCount = Math.ceil(pts.length * animProgress);
            const visiblePts = pts.slice(0, visibleCount);
            if (visiblePts.length < 2) return null;
            return (
              <path
                key={`line-${i}`}
                d={buildSmoothPath(visiblePts)}
                fill="none"
                stroke={mapColor(series[i].color)}
                strokeWidth={i === 2 ? 1.5 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={i === 2 ? '6 3' : undefined}
              />
            );
          })}

          {/* Data points + value labels */}
          {seriesPoints.map((pts, si) =>
            pts.map((pt, pi) => {
              if (pi >= Math.ceil(pts.length * animProgress)) return null;
              const isActive =
                tooltip &&
                tooltip.x === pt.x &&
                tooltip.y === pt.y &&
                tooltip.seriesName === series[si].name;
              const color = mapColor(series[si].color);
              // Stagger: Revenue above (+), Expenses below (-), Net Profit further below
              const labelOffset = si === 0 ? -7 : si === 1 ? 10 : 12;

              return (
                <g key={`pt-${si}-${pi}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isActive ? 4 : 2}
                    fill={color}
                    stroke="var(--bg-deep)"
                    strokeWidth={2}
                    style={{
                      filter: `drop-shadow(0 0 3px ${color}80)`,
                      cursor: 'pointer',
                      transition: 'r 0.15s ease',
                    }}
                    onMouseEnter={() =>
                      setTooltip({
                        x: pt.x,
                        y: pt.y,
                        value: pt.value,
                        month: months[pi],
                        color,
                        seriesName: series[si].name,
                      })
                    }
                  />
                  <text
                    x={pt.x}
                    y={pt.y + labelOffset}
                    textAnchor="middle"
                    fill={color}
                    style={{
                      fontFamily: FONTS.label.family,
                      fontSize: 6,
                      fontWeight: 600,
                      opacity: 0.9,
                      pointerEvents: 'none',
                    }}
                  >
                    {pt.value.toFixed(1)}
                  </text>
                </g>
              );
            })
          )}

          {/* Crosshair + tooltip */}
          {tooltip && (
            <>
              <line
                x1={tooltip.x}
                y1={CHART.padTop}
                x2={tooltip.x}
                y2={CHART.height - CHART.padBottom}
                strokeWidth={1}
                strokeDasharray="3 2"
                style={{ stroke: 'var(--border-card)' }}
              />
              <line
                x1={CHART.padLeft}
                y1={tooltip.y}
                x2={CHART.width - CHART.padRight}
                y2={tooltip.y}
                strokeWidth={1}
                strokeDasharray="3 2"
                style={{ stroke: 'var(--border-card)' }}
              />
              <rect
                x={tooltip.x + 8}
                y={tooltip.y - 22}
                width={90}
                height={22}
                rx={4}
                stroke={tooltip.color}
                strokeWidth={0.5}
                style={{ fill: 'var(--tooltip-bg)' }}
              />
              <text
                x={tooltip.x + 14}
                y={tooltip.y - 8}
                style={{
                  fontFamily: FONTS.body.family,
                  fontSize: 9,
                  fill: tooltip.color,
                  fontWeight: 600,
                }}
              >
                {tooltip.month}: ₹{tooltip.value.toFixed(2)} Cr
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
