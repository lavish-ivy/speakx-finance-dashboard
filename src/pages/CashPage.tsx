import { useState, useEffect } from 'react';
import EditorialPageShell from '../hud/shared/EditorialPageShell';
import EditorialDataTable, { type EditorialDataRow } from '../hud/shared/EditorialDataTable';
import PanelFootnote from '../hud/shared/PanelFootnote';
import { FONTS, SIZES } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyOCF,
  monthlyICF,
  monthlyFinancingCF,
  monthlyCapEx,
  monthlyTreasuryCF,
  monthlyFreeCashFlow,
  monthlyNetCF,
  monthlyRevenue,
  monthlyCOGS,
  monthlyTotalOpex,
  monthlyOperatingExpenses,
  monthlyFinanceCosts,
  monthlyOtherIncome,
  monthlyTax,
  monthlyCA,
  monthlyCL,
  monthlyInvestments,
  monthlyFixedAssets,
  aggregateCF,
  cfPeriodLabels,
  formatCr,
  aggregate,
  periodLabels,
} from '../data/financialData';
import { niceAxis } from '../utils/chartMath';

/**
 * CashPage — editorial rewrite.
 *
 * Replaces the gamer-HUD chrome (Orbitron titles, JetBrains Mono axis labels,
 * `#00FFCC`/`#FF9F0A`/`#BF5AF2` hex literals, `filter: drop-shadow` glows,
 * GlassCard backdrop blur, and the amber rgba "classification notes" warning
 * box) with the editorial IA used by `HUD.tsx` and `HeroStatement.tsx`.
 *
 * Structural change from the prior version:
 *
 *   • `Runway` KPI → replaced with `Months coverage` in the hero strip. For
 *     a cash-positive company (PBT > 0) "runway" is the wrong frame — runway
 *     measures time-to-zero under burn, and SpeakX is not burning.
 *     "Months coverage" is the stress-test: if revenue went to zero tomorrow,
 *     how many months of OpEx could the treasury absorb? Same denominator,
 *     correct framing.
 *
 *   • Two EditorialDataTable instances — indirect method (balance-sheet deltas)
 *     and direct method (Cash P&L) — with a reconciliation row at the bottom
 *     of the direct table quantifying the drift (≈ change in working capital).
 *
 *   • Amber classification warning box replaced with a PanelFootnote strip
 *     of Ind-AS 7 methodology notes.
 */

const sumArr = (a: number[]) => a.reduce((s, v) => s + v, 0);
const LAKHS_PER_CRORE = 100;

// ── SVG helpers ─────────────────────────────────────────────────────────────

function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const panelFrame: React.CSSProperties = {
  padding: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

/** Months of expense coverage at the current run-rate. */
function coverageMonths(liquidity: number, annualExpense: number): number {
  if (annualExpense <= 0) return 0;
  return +(liquidity / (annualExpense / 12)).toFixed(1);
}

// ── Hero standfirst — the CFO take-home for cash ────────────────────────────

interface HeroFigure {
  label: string;
  value: string;
  accent?: boolean;
}

function CashHero() {
  const { isMobile, isTablet } = useBreakpoint();
  const mask = useMaskedValue();

  const totalOCF = sumArr(monthlyOCF) / LAKHS_PER_CRORE;
  const totalFCF = sumArr(monthlyFreeCashFlow) / LAKHS_PER_CRORE;
  const totalCapEx = sumArr(monthlyCapEx) / LAKHS_PER_CRORE;

  const cashMar = monthlyCA[11] / LAKHS_PER_CRORE;
  const investmentsMar = monthlyInvestments[11] / LAKHS_PER_CRORE;
  const liquidityMar = +(cashMar + investmentsMar).toFixed(2);

  const revenueYtd = sumArr(monthlyRevenue) / LAKHS_PER_CRORE;
  const totalOpexCr = sumArr(monthlyTotalOpex) / LAKHS_PER_CRORE;
  const ocfMargin = revenueYtd === 0 ? 0 : (totalOCF / revenueYtd) * 100;
  const fcfMargin = revenueYtd === 0 ? 0 : (totalFCF / revenueYtd) * 100;

  // For a profitable company "runway" is the wrong frame. Stress-test the
  // liquidity pool against annual expenses — months of OpEx coverage.
  const coverage = coverageMonths(liquidityMar, totalOpexCr);

  const figures: HeroFigure[] = [
    { label: 'Operating cash flow', value: `₹${totalOCF.toFixed(2)}` },
    { label: 'Free cash flow',      value: `₹${totalFCF.toFixed(2)}` },
    { label: 'Closing liquidity',   value: `₹${liquidityMar.toFixed(2)}`, accent: true },
    { label: 'Months coverage',     value: `${coverage.toFixed(1)} mo` },
  ];

  const figureFontSize = isMobile ? 26 : isTablet ? 30 : 38;
  const standfirstSize = isMobile ? 16 : isTablet ? 19 : 22;

  return (
    <section
      className="fade-in-up"
      style={{
        animationDelay: '0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 14 : 18,
      }}
    >
      <p
        style={{
          fontFamily: FONTS.serif.family,
          fontSize: standfirstSize,
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.4,
          color: 'var(--text-primary)',
          letterSpacing: '-0.005em',
          margin: 0,
          maxWidth: '68ch',
        }}
      >
        Across the 11-month cash window (May–Mar), operations generated{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`₹${totalOCF.toFixed(2)} Cr`)}
        </strong>{' '}
        of cash ({mask(`${ocfMargin.toFixed(1)}%`)} of revenue), and after{' '}
        {mask(`₹${Math.abs(totalCapEx).toFixed(2)} Cr`)} of CapEx free cash flow
        came in at{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`₹${totalFCF.toFixed(2)} Cr`)}
        </strong>{' '}
        ({mask(`${fcfMargin.toFixed(1)}%`)} margin). The treasury closed March
        with{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--accent-coral)' }}>
          {mask(`₹${liquidityMar.toFixed(2)} Cr`)}
        </strong>{' '}
        of liquidity — roughly {coverage.toFixed(1)} months of operating
        expense coverage at the current run-rate.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? 14 : 28,
          paddingTop: isMobile ? 12 : 14,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {figures.map((f) => (
          <div key={f.label}>
            <div
              style={{
                fontFamily: FONTS.caption.family,
                fontSize: 9,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--text-muted)',
                marginBottom: 6,
              }}
            >
              {f.label}
            </div>
            <div
              style={{
                fontFamily: FONTS.serif.family,
                fontSize: figureFontSize,
                fontWeight: 500,
                lineHeight: 1,
                color: f.accent ? 'var(--accent-coral)' : 'var(--text-primary)',
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums lining-nums',
                display: 'flex',
                alignItems: 'baseline',
                gap: 4,
              }}
            >
              <span>{mask(f.value)}</span>
              {f.value.startsWith('₹') && (
                <span
                  style={{
                    fontFamily: FONTS.caption.family,
                    fontSize: 10,
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                  }}
                >
                  Cr
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          paddingTop: 10,
          borderTop: '1px dashed var(--border-subtle)',
          fontFamily: FONTS.caption.family,
          fontSize: 9,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 12px',
        }}
      >
        <span>
          Cash {mask(`₹${cashMar.toFixed(2)} Cr`)} + Investments {mask(`₹${investmentsMar.toFixed(2)} Cr`)} = Liquidity {mask(`₹${liquidityMar.toFixed(2)} Cr`)}
        </span>
        <span aria-hidden>·</span>
        <span>Months-coverage frame replaces "runway" — SpeakX is cash-positive, not burning</span>
        <span aria-hidden>·</span>
        <span>CF window is 11 months (May–Mar): April has no prior-month BS baseline</span>
      </div>
    </section>
  );
}

// ── Liquidity Trend Chart — full-width hero ─────────────────────────────────

interface TooltipData {
  x: number;
  y: number;
  value: number;
  month: string;
}

function LiquidityTrendChart() {
  const { period } = useDashboard();
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

  const liquidityLakhs = monthlyCA.map((ca, i) =>
    +(ca + monthlyInvestments[i]).toFixed(2),
  );
  const data = aggregate(liquidityLakhs, period, true);
  const labels = periodLabels(period);

  const axis = niceAxis(Math.min(...data), Math.max(...data), 5);
  const range = axis.hi - axis.lo || 1;

  const w = 880;
  const h = isMobile ? 220 : 260;
  const padL = 58;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const cW = w - padL - padR;
  const cH = h - padT - padB;

  const points = data.map((v, i) => ({
    x: padL + (i / Math.max(1, data.length - 1)) * cW,
    y: padT + cH - ((v - axis.lo) / range) * cH,
    value: v,
  }));

  const visibleCount = Math.ceil(points.length * animProgress);
  const visiblePts = points.slice(0, visibleCount);

  const linePath = catmullRomPath(visiblePts);
  const areaPath =
    visiblePts.length >= 2
      ? `${linePath} L ${visiblePts[visiblePts.length - 1].x} ${padT + cH} L ${visiblePts[0].x} ${padT + cH} Z`
      : '';

  const liqColor = mapColor('#BF5AF2');

  // YTD closing liquidity — single number for the header right rail
  const closing = data[data.length - 1];

  return (
    <div
      className="fade-in-up"
      style={{
        ...panelFrame,
        animationDelay: '0.25s',
      }}
    >
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
            Liquidity trajectory
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
            Month-end · Cash + Treasury Investments · ₹ Crores
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 5,
            fontFamily: FONTS.sans.family,
            fontVariantNumeric: 'tabular-nums lining-nums',
          }}
        >
          <div style={{ width: 6, height: 1, background: liqColor, alignSelf: 'center' }} />
          <span
            style={{
              color: 'var(--text-muted)',
              fontFamily: FONTS.caption.family,
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Closing
          </span>
          <span
            style={{
              color: 'var(--text-primary)',
              fontFamily: FONTS.data.family,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {mask(formatCr(closing))}
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: isMobile ? 200 : 0, overflow: 'hidden' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id="liqAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={liqColor} stopOpacity={0.22} />
              <stop offset="100%" stopColor={liqColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {axis.ticks.map((tv) => {
            const yy = padT + cH - ((tv - axis.lo) / range) * cH;
            return (
              <g key={tv}>
                <line
                  x1={padL}
                  y1={yy}
                  x2={padL + cW}
                  y2={yy}
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  style={{ stroke: 'var(--chart-gridline)' }}
                />
                <text
                  x={padL - 6}
                  y={yy + 3}
                  textAnchor="end"
                  style={{
                    fontFamily: FONTS.label.family,
                    fontSize: 9,
                    fill: 'var(--text-muted)',
                  }}
                >
                  {mask(formatCr(tv))}
                </text>
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#liqAreaGrad)" />}

          {linePath && (
            <path
              d={linePath}
              stroke={liqColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((p, i) => {
            if (i >= visibleCount) return null;
            const isActive = tooltip && tooltip.month === labels[i];
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isActive ? 3.5 : 1.8}
                fill={liqColor}
                stroke="var(--bg-deep)"
                strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                onMouseEnter={() =>
                  setTooltip({ x: p.x, y: p.y, value: p.value, month: labels[i] })
                }
              />
            );
          })}

          {labels.map((m, i) => (
            <text
              key={m}
              x={padL + (i / Math.max(1, labels.length - 1)) * cW}
              y={h - 4}
              textAnchor="middle"
              style={{
                fontFamily: FONTS.label.family,
                fontSize: 9,
                fill: 'var(--text-muted)',
              }}
            >
              {m}
            </text>
          ))}

          {tooltip && (
            <>
              <line
                x1={tooltip.x}
                y1={padT}
                x2={tooltip.x}
                y2={h - padB}
                strokeWidth={1}
                strokeDasharray="3 2"
                style={{ stroke: 'var(--border-card)' }}
              />
              <rect
                x={tooltip.x + 8}
                y={tooltip.y - 22}
                width={110}
                height={22}
                rx={4}
                stroke={liqColor}
                strokeWidth={0.5}
                style={{ fill: 'var(--tooltip-bg)' }}
              />
              <text
                x={tooltip.x + 14}
                y={tooltip.y - 8}
                style={{
                  fontFamily: FONTS.body.family,
                  fontSize: 9,
                  fill: liqColor,
                  fontWeight: 600,
                }}
              >
                {tooltip.month}: {mask(formatCr(tooltip.value))}
              </text>
            </>
          )}
        </svg>
      </div>

      <PanelFootnote
        notes={[
          'Liquidity = Tally Current Assets + Investments (treasury)',
          'No trade receivables — SpeakX B2C model settles via Razorpay/PhonePe',
          'Oct-Nov step-up reflects capital raise deployment into treasury',
        ]}
      />
    </div>
  );
}

// ── Cash Flow Components Chart — supporting ─────────────────────────────────

function CashFlowGroupedChart() {
  const { period } = useDashboard();
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();
  const mask = useMaskedValue();

  const ocf = aggregateCF(monthlyOCF, period);
  const icf = aggregateCF(monthlyICF, period);
  const fin = aggregateCF(monthlyFinancingCF, period);
  const fcf = aggregateCF(monthlyFreeCashFlow, period);
  const labels = cfPeriodLabels(period);

  const allVals = [...ocf, ...icf, ...fin, ...fcf];
  const maxAbs = Math.max(...allVals.map(Math.abs)) * 1.15 || 1;

  const w = 880;
  const h = isMobile ? 220 : 260;
  const padL = 58;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const groupW = cW / labels.length;
  const barW = Math.min(10, groupW * 0.17);
  const zeroY = padT + cH / 2;

  const toY = (v: number) => zeroY - (v / maxAbs) * (cH / 2);

  const series = [
    { label: 'Operating CF', slot: '#00FFCC', data: ocf },
    { label: 'Free cash flow', slot: '#FFD700', data: fcf },
    { label: 'Investing CF', slot: '#FF9F0A', data: icf },
    { label: 'Financing CF', slot: '#64D2FF', data: fin },
  ];

  return (
    <div
      className="fade-in-up"
      style={{
        ...panelFrame,
        animationDelay: '0.3s',
      }}
    >
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
            Cash flow components
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
            Grouped bars · Operating · Investing · Financing · Free cash flow
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            fontFamily: FONTS.sans.family,
          }}
        >
          {series.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, background: mapColor(s.slot) }} />
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: FONTS.caption.family,
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: isMobile ? 200 : 0, overflow: 'hidden' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
        >
          {/* Zero baseline */}
          <line
            x1={padL}
            y1={zeroY}
            x2={padL + cW}
            y2={zeroY}
            strokeWidth={1.2}
            style={{ stroke: 'var(--text-muted)' }}
            opacity={0.5}
          />

          {/* Grid */}
          {[-1, -0.5, 0.5, 1].map((frac) => {
            const val = frac * maxAbs;
            const yy = toY(val);
            return (
              <g key={frac}>
                <line
                  x1={padL}
                  y1={yy}
                  x2={padL + cW}
                  y2={yy}
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  style={{ stroke: 'var(--chart-gridline)' }}
                />
                <text
                  x={padL - 6}
                  y={yy + 3}
                  textAnchor="end"
                  style={{
                    fontFamily: FONTS.label.family,
                    fontSize: 9,
                    fill: 'var(--text-muted)',
                  }}
                >
                  {mask(formatCr(val))}
                </text>
              </g>
            );
          })}

          {labels.map((_, i) => {
            const groupCx = padL + (i + 0.5) * groupW;
            return (
              <g key={i}>
                {series.map((s, si) => {
                  const v = s.data[i];
                  const barH = Math.abs(v / maxAbs) * (cH / 2);
                  const barY = v >= 0 ? toY(v) : zeroY;
                  const xOff = (si - 1.5) * (barW + 2);
                  const barCx = groupCx + xOff;
                  const color = mapColor(s.slot);
                  const isNegative = v < 0;
                  return (
                    <rect
                      key={si}
                      x={barCx - barW / 2}
                      y={barY}
                      width={barW}
                      height={barH}
                      fill={isNegative ? 'var(--accent-coral)' : color}
                      opacity={isNegative ? 0.7 : 0.75}
                    />
                  );
                })}
              </g>
            );
          })}

          {labels.map((m, i) => (
            <text
              key={m}
              x={padL + (i + 0.5) * groupW}
              y={h - 4}
              textAnchor="middle"
              style={{
                fontFamily: FONTS.label.family,
                fontSize: 9,
                fill: 'var(--text-muted)',
              }}
            >
              {m}
            </text>
          ))}
        </svg>
      </div>

      <PanelFootnote
        notes={[
          'OCF derived from balance-sheet deltas (indirect method)',
          'Treasury deployment shown in Investing CF — Oct-Nov capital raise',
          'Negative bars rendered in burgundy — no convention-flipping',
        ]}
      />
    </div>
  );
}

// ── Main Cash Page ──────────────────────────────────────────────────────────

export default function CashPage() {
  const { period } = useDashboard();
  const { isMobile } = useBreakpoint();

  // ── YTD cash-flow aggregates ──────────────────────────────────────────────
  const totalOCF = sumArr(monthlyOCF);
  const totalCapEx = sumArr(monthlyCapEx);
  const totalTreasury = sumArr(monthlyTreasuryCF);
  const totalICF = sumArr(monthlyICF);
  const totalFinCF = sumArr(monthlyFinancingCF);
  const totalFCF = sumArr(monthlyFreeCashFlow);
  const totalNetCF = sumArr(monthlyNetCF);

  const cfLabels = cfPeriodLabels(period);
  const indirectHeaders = ['Component', ...cfLabels, 'YTD'];

  const indirectRows: EditorialDataRow[] = [
    { label: '— Operating activities —', values: [], ytd: 0, section: true },
    { label: 'Operating Cash Flow', values: aggregateCF(monthlyOCF, period), ytd: totalOCF, bold: true },
    { label: '— Investing activities —', values: [], ytd: 0, section: true },
    { label: 'CapEx (Fixed Assets)', values: aggregateCF(monthlyCapEx, period), ytd: totalCapEx, indent: true },
    { label: 'Treasury (MF / Bonds / FD)', values: aggregateCF(monthlyTreasuryCF, period), ytd: totalTreasury, indent: true },
    { label: 'Investing Cash Flow', values: aggregateCF(monthlyICF, period), ytd: totalICF, bold: true },
    { label: '— Financing activities —', values: [], ytd: 0, section: true },
    { label: 'Financing Cash Flow', values: aggregateCF(monthlyFinancingCF, period), ytd: totalFinCF, bold: true },
    { label: '— Results —', values: [], ytd: 0, section: true },
    { label: 'Free Cash Flow (OCF − CapEx)', values: aggregateCF(monthlyFreeCashFlow, period), ytd: totalFCF, bold: true, highlight: true },
    { label: 'Net Change in Cash', values: aggregateCF(monthlyNetCF, period), ytd: totalNetCF, bold: true, highlight: true },
  ];

  // ── Direct Method — reconciled to indirect ──────────────────────────────
  //
  // The indirect method covers May–Mar (11 months) because OCF is derived
  // from BS deltas (ΔCL requires two consecutive snapshots, so April has no
  // entry). Align the direct method to the SAME 11-month window by slicing
  // April off the P&L arrays. This lets both methods reconcile exactly
  // instead of papering over the window mismatch with zero-padding.
  //
  // Under SpeakX's group-level TB constraints:
  //   • D&A = 0 (not captured monthly at group level)
  //   • Tax = 0 (year-end §115BAA provision not yet booked)
  //   • AR ≈ 0 (B2C, card/UPI-settled)
  //   • No inventory (service business)
  //
  // the direct-method identity holds by construction:
  //
  //   Direct OCF = (Rev + OI − COGS − OpEx_ex_fin − Finance − Tax) + ΔCL
  //              = PBT + ΔCL
  //              = Indirect OCF      // reconciles to zero drift every period
  //
  // Sign convention: receipts positive, payments negative — consistent with
  // the indirect table where CapEx and Treasury already render negative.
  // Interest paid is shown on its own line per Ind-AS 7 para 31; income tax
  // paid is shown at zero with a methodology footnote.

  // Slice May..Mar (11 months) off the 12-month P&L arrays.
  const sliceCF = <T,>(arr: readonly T[]): T[] => arr.slice(1);

  const revCF        = sliceCF(monthlyRevenue);
  const oiCF         = sliceCF(monthlyOtherIncome);
  const cogsCF       = sliceCF(monthlyCOGS).map((v) => -v);         // outflow
  const opexExFinCF  = sliceCF(monthlyOperatingExpenses).map((v) => -v);
  const interestCF   = sliceCF(monthlyFinanceCosts).map((v) => -v);
  const taxPaidCF    = sliceCF(monthlyTax).map((v) => -v);          // all zero

  // Δ Current Liabilities over May..Mar — the bridge to indirect.
  const deltaCLCF = Array.from({ length: 11 }, (_, i) =>
    +(monthlyCL[i + 1] - monthlyCL[i]).toFixed(2),
  );

  // Period-level aggregates (11 points, Q, or FY — cfPeriodLabels already
  // handles the May..Mar window).
  const revAggCF        = aggregateCF(revCF, period);
  const oiAggCF         = aggregateCF(oiCF, period);
  const receiptsAggCF   = revAggCF.map((r, i) => +(r + oiAggCF[i]).toFixed(2));
  const cogsAggCF       = aggregateCF(cogsCF, period);
  const opexAggCF       = aggregateCF(opexExFinCF, period);
  const interestAggCF   = aggregateCF(interestCF, period);
  const taxAggCF        = aggregateCF(taxPaidCF, period);
  const paymentsAggCF   = cogsAggCF.map(
    (c, i) => +(c + opexAggCF[i] + interestAggCF[i] + taxAggCF[i]).toFixed(2),
  );
  const preWCAggCF      = receiptsAggCF.map(
    (r, i) => +(r + paymentsAggCF[i]).toFixed(2),
  );
  const deltaCLAggCF    = aggregateCF(deltaCLCF, period);
  const reconOCFAggCF   = preWCAggCF.map(
    (p, i) => +(p + deltaCLAggCF[i]).toFixed(2),
  );
  const indirectAggCF   = aggregateCF(monthlyOCF, period);
  const driftAggCF      = reconOCFAggCF.map(
    (v, i) => +(v - indirectAggCF[i]).toFixed(2),
  );

  // YTD totals
  const revYtdCF      = +sumArr(revCF).toFixed(2);
  const oiYtdCF       = +sumArr(oiCF).toFixed(2);
  const receiptsYtdCF = +(revYtdCF + oiYtdCF).toFixed(2);
  const cogsYtdCF     = +sumArr(cogsCF).toFixed(2);
  const opexYtdCF     = +sumArr(opexExFinCF).toFixed(2);
  const interestYtdCF = +sumArr(interestCF).toFixed(2);
  const taxYtdCF      = +sumArr(taxPaidCF).toFixed(2);
  const paymentsYtdCF = +(cogsYtdCF + opexYtdCF + interestYtdCF + taxYtdCF).toFixed(2);
  const preWCYtdCF    = +(receiptsYtdCF + paymentsYtdCF).toFixed(2);
  const deltaCLYtdCF  = +sumArr(deltaCLCF).toFixed(2);
  const reconOCFYtdCF = +(preWCYtdCF + deltaCLYtdCF).toFixed(2);
  const driftYtdCF    = +(reconOCFYtdCF - totalOCF).toFixed(2);

  const directHeaders = ['Cash flow', ...cfLabels, 'YTD'];

  const directRows: EditorialDataRow[] = [
    { label: '— Operating receipts —', values: [], ytd: 0, section: true },
    { label: 'Cash received from customers', values: revAggCF, ytd: revYtdCF, indent: true },
    { label: 'Other operating receipts', values: oiAggCF, ytd: oiYtdCF, indent: true },
    { label: 'Total operating receipts', values: receiptsAggCF, ytd: receiptsYtdCF, bold: true },

    { label: '— Operating payments —', values: [], ytd: 0, section: true },
    { label: 'Cost of revenue paid', values: cogsAggCF, ytd: cogsYtdCF, indent: true },
    { label: 'Operating expenses paid (ex-interest)', values: opexAggCF, ytd: opexYtdCF, indent: true },
    { label: 'Interest paid', values: interestAggCF, ytd: interestYtdCF, indent: true },
    { label: 'Income tax paid', values: taxAggCF, ytd: taxYtdCF, indent: true },
    { label: 'Total operating payments', values: paymentsAggCF, ytd: paymentsYtdCF, bold: true },

    { label: '— Bridge to indirect —', values: [], ytd: 0, section: true },
    { label: 'Cash surplus before working capital', values: preWCAggCF, ytd: preWCYtdCF, bold: true },
    { label: 'Δ Current Liabilities', values: deltaCLAggCF, ytd: deltaCLYtdCF, indent: true },

    { label: '— Reconciled result —', values: [], ytd: 0, section: true },
    { label: 'Net cash from operations (direct)', values: reconOCFAggCF, ytd: reconOCFYtdCF, bold: true, highlight: true },
    { label: 'Indirect-method OCF (reference)', values: indirectAggCF, ytd: totalOCF, indent: true },
    { label: 'Drift vs indirect', values: driftAggCF, ytd: driftYtdCF, pctRow: true },
  ];

  const latestFAFormatted = formatCr(monthlyFixedAssets[11]);

  return (
    <EditorialPageShell
      title="Cash flow & liquidity"
      eyebrow="Route · Cash · FY 2025-26 · Ind-AS 7 direct + indirect"
    >
      <CashHero />

      <hr className="rule rule--thick" style={{ margin: 0 }} />

      <LiquidityTrendChart />

      <hr className="rule" style={{ margin: 0 }} />

      <CashFlowGroupedChart />

      <hr className="rule" style={{ margin: 0 }} />

      {/* Indirect-method table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 18 }}>
        <div>
          <div
            style={{
              fontFamily: FONTS.serif.family,
              fontSize: isMobile ? SIZES.sectionTitleSm : SIZES.sectionTitle,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            Indirect method
          </div>
          <div
            style={{
              fontFamily: FONTS.caption.family,
              fontSize: 9,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
            }}
          >
            Derived from balance-sheet deltas · Ind-AS 7 compliant
          </div>
        </div>

        <EditorialDataTable
          headers={indirectHeaders}
          rows={indirectRows}
          formatValue={(v) => formatCr(v)}
          defaultOpen
          toggleLabel="View indirect method"
        />
      </div>

      <hr className="rule" style={{ margin: 0 }} />

      {/* Direct-method table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 18 }}>
        <div>
          <div
            style={{
              fontFamily: FONTS.serif.family,
              fontSize: isMobile ? SIZES.sectionTitleSm : SIZES.sectionTitle,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            Direct method
          </div>
          <div
            style={{
              fontFamily: FONTS.caption.family,
              fontSize: 9,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
            }}
          >
            Receipts − payments − interest · Bridged to indirect via ΔCL · May–Mar window
          </div>
        </div>

        <EditorialDataTable
          headers={directHeaders}
          rows={directRows}
          formatValue={(v) => formatCr(v)}
          defaultOpen
          toggleLabel="View direct method"
        />

        <PanelFootnote
          notes={[
            `Window May–Mar (11 months) — April excluded because indirect OCF uses ΔCL and needs two consecutive BS snapshots`,
            `Cash received from customers ≈ Revenue — SpeakX is B2C cash-settled (card/UPI), AR ≈ 0`,
            `Other operating receipts = Other Income on accrual basis — may include unrealised MF marking; year-end provision reversal visible in March`,
            `Interest paid disclosed on its own line per Ind-AS 7 para 31; classified under Operating per para 33(a)`,
            `Income tax paid ₹0 — year-end §115BAA provision not yet booked; see P&L page for the statutory estimate`,
            `Δ Current Liabilities bridges the cash-basis P&L to indirect OCF — drift row reconciles to ≈ 0 by construction (D&A = 0 at group level)`,
            `Fixed Assets ${latestFAFormatted} excluded from liquidity; treasury deployment sits in Investing CF`,
          ]}
        />
      </div>
    </EditorialPageShell>
  );
}
