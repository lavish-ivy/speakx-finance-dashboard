import React, { useState, useEffect } from 'react';
import { FONTS, SIZES } from '../../theme/typography';
import {
  MONTHS,
  monthlyRevenue as monthlyRevenueLakhs,
  monthlyCOGS as monthlyCOGSLakhs,
  monthlyTotalOpex as monthlyOpexLakhs,
  monthlyPBT as monthlyPBTLakhs,
} from '../../data/financialData';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useMaskedValue } from '../../context/DashboardContext';
import PanelFootnote from '../shared/PanelFootnote';

const LAKHS_PER_CRORE = 100;

/**
 * Convert a Lakhs value to Crores WITHOUT intermediate rounding. Rounding is
 * deferred to display time via `toFixed`, which means the sum of the rendered
 * per-point values reconciles exactly with a YTD computed from the same Lakhs
 * source. See the "sum of rounded values" drift note in `mockData.ts` and the
 * matching fix in `src/pages/PnlPage.tsx` (PATChart, RevenueEBITDAChart).
 */
const lakhsToCr = (lakhs: number): number => lakhs / LAKHS_PER_CRORE;

/** Sum a Lakhs array and convert to Crores with a single final rounding. */
const sumLakhsAsCr = (lakhs: number[]): number =>
  +(lakhs.reduce((a, b) => a + b, 0) / LAKHS_PER_CRORE).toFixed(2);

// Build the three display series directly from the Lakhs source of truth.
// Each point is an exact single /100 conversion — no per-month toFixed in Cr,
// so labels sum back to the YTD annotations rendered in the chart header.
//
// NOTE: the third series is the Tally-booked PBT, not "Net Profit". Since the
// current-year tax provision is only booked at year-end close, Tally reports
// ₹0 tax monthly and what used to display as "Net Profit" was silently the
// pre-tax number. Labeling it PBT here matches the FinancialKPIs strip and
// the P&L page's Booked-PBT vs Estimated-PAT framing.
const monthlyRevenueCr = monthlyRevenueLakhs.map(lakhsToCr);
const monthlyExpensesCr = monthlyCOGSLakhs.map(
  (c, i) => lakhsToCr(c + monthlyOpexLakhs[i]),
);
const monthlyPBTCr = monthlyPBTLakhs.map(lakhsToCr);

const ytdRevenueCr = sumLakhsAsCr(monthlyRevenueLakhs);
const ytdExpensesCr = sumLakhsAsCr(
  monthlyCOGSLakhs.map((c, i) => c + monthlyOpexLakhs[i]),
);
const ytdPBTCr = sumLakhsAsCr(monthlyPBTLakhs);

interface ChartSeries {
  name: string;
  color: string;
  data: number[];
  ytdCr: number;
}

const chartSeries: ChartSeries[] = [
  { name: 'Revenue',  color: '#00FFCC', data: monthlyRevenueCr,  ytdCr: ytdRevenueCr },
  { name: 'Expenses', color: '#FF453A', data: monthlyExpensesCr, ytdCr: ytdExpensesCr },
  { name: 'PBT',      color: '#FFD700', data: monthlyPBTCr,      ytdCr: ytdPBTCr },
];

// Editorial panel frame — no glass card, no backdrop blur, no border radius.
// The panel sits on the page; its only chrome is the surrounding hairline
// grid rules owned by HUD.tsx.
const panelFrame: React.CSSProperties = {
  padding: 0,
  height: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
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
  const mask = useMaskedValue();
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

  const months = MONTHS;
  const series = chartSeries;

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
        ...panelFrame,
        animationDelay: '0.1s',
      }}
    >
      {/* Editorial header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 14,
          flexShrink: 0,
          gap: 12,
          flexWrap: isMobile ? 'wrap' : undefined,
        }}
      >
        <div>
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
            Revenue vs Expenses
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
            Monthly · ₹ Crores · YTD totals on right
          </div>
        </div>

        {/* YTD reconciliation strip — each number matches the KPI strip */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontFamily: FONTS.sans.family,
            fontSize: isMobile ? 11 : 11,
            whiteSpace: 'nowrap',
            alignItems: 'baseline',
            fontVariantNumeric: 'tabular-nums lining-nums',
          }}
        >
          {series.map((s) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <div
                style={{
                  width: 6,
                  height: 1,
                  background: mapColor(s.color),
                  alignSelf: 'center',
                }}
              />
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: FONTS.caption.family,
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {s.name}
              </span>
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  fontFamily: FONTS.data.family,
                  letterSpacing: '-0.005em',
                }}
              >
                {mask(`${s.ytdCr >= 0 ? '' : '−'}₹${Math.abs(s.ytdCr).toFixed(2)} Cr`)}
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
                    r={isActive ? 3.5 : 1.8}
                    fill={color}
                    stroke="var(--bg-deep)"
                    strokeWidth={1.5}
                    style={{
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

      <PanelFootnote
        notes={[
          'Revenue & Expenses on accrual basis',
          'PBT (dashed) shown pre-tax — Tally books no monthly tax provision under §115BAA',
          'Mar-26 Other Income elevated by year-end treasury accrual',
        ]}
      />
    </div>
  );
}
