import { useState, useEffect } from 'react';
import EditorialPageShell from '../hud/shared/EditorialPageShell';
import EditorialDataTable, { type EditorialDataRow } from '../hud/shared/EditorialDataTable';
import PanelFootnote from '../hud/shared/PanelFootnote';
import { FONTS, SIZES } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyRevenue,
  monthlyEBITDA,
  monthlyPAT,
  monthlyOperatingExpenses,
  monthlyGrossProfit,
  monthlyFinanceCosts,
  monthlyPBT,
  STATUTORY_TAX_RATE,
  pnlStructure,
  aggregate,
  periodLabels,
  formatCr,
} from '../data/financialData';

/**
 * PnlPage — editorial rewrite.
 *
 * This file used to carry gamer-HUD chrome: Orbitron chart titles, JetBrains
 * Mono axis labels, `#00FFCC` / `#FF9F0A` hex literals, `filter: drop-shadow`
 * glows, GlassCard backdrop blur, and an amber-rgba warning box for the tax
 * provision note. It all fought the CFO-editorial direction the Overview now
 * runs on.
 *
 * The rewrite aligns with `HUD.tsx` / `HeroStatement.tsx` / `MarginTrends.tsx`:
 *
 *   EditorialPageShell
 *     └─ Header + eyebrow + serif title + rule--thick
 *     └─ PnlHero       — italic standfirst + 4 display figures + bridge footnote
 *     └─ rule--thick
 *     └─ MarginTrendChart (full-width hero chart — GM%, EBITDA%, PAT%)
 *     └─ rule
 *     └─ RevenueEBITDAChart (supporting — bars + EBITDA line)
 *     └─ rule
 *     └─ EditorialDataTable — pnlStructure rows
 *     └─ PanelFootnote — tax provision methodology
 *
 * All hardcoded hex colors are routed through `mapColor()` so the theme
 * context can map them into the warm-paper palette (dark-mode terracotta,
 * light-mode burgundy) without cascade edits. All neon glow filters are
 * removed. All Orbitron / JetBrains Mono font literals are replaced with
 * `FONTS.serif / FONTS.data / FONTS.caption / FONTS.label`.
 */

const sumArr = (a: number[]) => a.reduce((s, v) => s + v, 0);
const LAKHS_PER_CRORE = 100;

// ── SVG geometry helpers ────────────────────────────────────────────────────

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

// ── Editorial panel frame (no glass card, no border radius) ─────────────────

const panelFrame: React.CSSProperties = {
  padding: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

// ── Hero standfirst — the CFO take-home for P&L ─────────────────────────────

interface HeroFigure {
  label: string;
  value: string;
  accent?: boolean;
}

function PnlHero() {
  const { isMobile, isTablet } = useBreakpoint();
  const mask = useMaskedValue();

  const totalRev = sumArr(monthlyRevenue) / LAKHS_PER_CRORE;
  const totalGP = sumArr(monthlyGrossProfit) / LAKHS_PER_CRORE;
  const totalEBITDA = sumArr(monthlyEBITDA) / LAKHS_PER_CRORE;
  const totalPBT = sumArr(monthlyPBT) / LAKHS_PER_CRORE;
  const totalOpex = sumArr(monthlyOperatingExpenses) / LAKHS_PER_CRORE;
  const totalFinCost = sumArr(monthlyFinanceCosts) / LAKHS_PER_CRORE;

  const gmPct = totalRev === 0 ? 0 : (totalGP / totalRev) * 100;
  const ebitdaPct = totalRev === 0 ? 0 : (totalEBITDA / totalRev) * 100;

  const estTaxProvision = totalPBT > 0 ? +(totalPBT * STATUTORY_TAX_RATE).toFixed(2) : 0;
  const estPat = +(totalPBT - estTaxProvision).toFixed(2);
  const taxRatePct = (STATUTORY_TAX_RATE * 100).toFixed(2);

  const figures: HeroFigure[] = [
    { label: 'Revenue',       value: `₹${totalRev.toFixed(2)}` },
    { label: 'Gross margin',  value: `${gmPct.toFixed(1)}%` },
    { label: 'EBITDA',        value: `₹${totalEBITDA.toFixed(2)}` },
    { label: 'Estimated PAT', value: `₹${estPat.toFixed(2)}`, accent: true },
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
        SpeakX closed FY 2025-26 with{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`₹${totalRev.toFixed(2)} Cr`)}
        </strong>{' '}
        in revenue at a{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`${gmPct.toFixed(1)}%`)}
        </strong>{' '}
        gross margin. Operating leverage delivered{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`₹${totalEBITDA.toFixed(2)} Cr`)}
        </strong>{' '}
        of EBITDA ({mask(`${ebitdaPct.toFixed(1)}%`)} margin), and after an
        estimated {taxRatePct}% §115BAA tax provision the bottom line settles at{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--accent-coral)' }}>
          {mask(`₹${estPat.toFixed(2)} Cr`)}
        </strong>{' '}
        of PAT — the profit the business would report on audit close.
      </p>

      {/* Four display figures */}
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

      {/* PBT → PAT bridge footnote */}
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
          PBT → PAT bridge: {mask(`₹${totalPBT.toFixed(2)}`)} −{' '}
          {mask(`₹${estTaxProvision.toFixed(2)}`)} (tax @{taxRatePct}%) ={' '}
          {mask(`₹${estPat.toFixed(2)}`)}
        </span>
        <span aria-hidden>·</span>
        <span>
          Operating expenses {mask(`₹${totalOpex.toFixed(2)} Cr`)} · Finance costs{' '}
          {mask(`₹${totalFinCost.toFixed(2)} Cr`)}
        </span>
        <span aria-hidden>·</span>
        <span>Tax provision not yet booked in Tally; year-end adjustment</span>
      </div>
    </section>
  );
}

// ── Margin Trend Chart (GM%, EBITDA%, PAT%) — full-width hero chart ─────────

interface TooltipData {
  x: number;
  y: number;
  value: number;
  month: string;
  color: string;
  seriesName: string;
}

function MarginTrendChart() {
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

  const rev = aggregate(monthlyRevenue, period);
  const gp = aggregate(monthlyGrossProfit, period);
  const ebitda = aggregate(monthlyEBITDA, period);
  const pat = aggregate(monthlyPAT, period);
  const labels = periodLabels(period);

  // Divide-by-zero safe (early-FY months may have zero revenue).
  const gmPct = rev.map((r, i) => (r === 0 ? 0 : +((gp[i] / r) * 100).toFixed(1)));
  const ebitdaPct = rev.map((r, i) => (r === 0 ? 0 : +((ebitda[i] / r) * 100).toFixed(1)));
  const patPct = rev.map((r, i) => (r === 0 ? 0 : +((pat[i] / r) * 100).toFixed(1)));

  // YTD margins from Lakhs source with a single final /100 conversion — matches
  // the hero statement and avoids "sum of 2dp rounded points" drift.
  const ytdRev = monthlyRevenue.reduce((a, b) => a + b, 0);
  const ytdGP = monthlyGrossProfit.reduce((a, b) => a + b, 0);
  const ytdEB = monthlyEBITDA.reduce((a, b) => a + b, 0);
  const ytdPAT = monthlyPAT.reduce((a, b) => a + b, 0);
  const ytdGMPct = ytdRev === 0 ? 0 : (ytdGP / ytdRev) * 100;
  const ytdEBPct = ytdRev === 0 ? 0 : (ytdEB / ytdRev) * 100;
  const ytdPATPct = ytdRev === 0 ? 0 : (ytdPAT / ytdRev) * 100;

  const series = [
    { name: 'Gross margin', shortName: 'GM%',     slot: '#00FFCC', data: gmPct,     ytd: ytdGMPct },
    { name: 'EBITDA margin', shortName: 'EBITDA%', slot: '#FF9F0A', data: ebitdaPct, ytd: ytdEBPct },
    { name: 'PAT margin',    shortName: 'PAT%',    slot: '#BF5AF2', data: patPct,    ytd: ytdPATPct },
  ];

  const allVals = [...gmPct, ...ebitdaPct, ...patPct];
  const rawMin = Math.min(0, ...allVals);
  const rawMax = Math.max(...allVals);
  const span = Math.max(rawMax - rawMin, 10);
  const minVal = rawMin - span * 0.1;
  const maxVal = rawMax + span * 0.18;
  const range = maxVal - minVal || 1;

  const w = 880;
  const h = isMobile ? 220 : 260;
  const padL = 44;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const cW = w - padL - padR;
  const cH = h - padT - padB;

  const toX = (i: number) => padL + ((i + 0.5) / labels.length) * cW;
  const toY = (v: number) => padT + cH - ((v - minVal) / range) * cH;

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

  const seriesPoints = series.map((s) =>
    s.data.map((val, i) => ({
      x: toX(i),
      y: toY(val),
      value: val,
    })),
  );

  return (
    <div
      className="fade-in-up"
      style={{
        ...panelFrame,
        animationDelay: '0.25s',
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
            Margin trajectory
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
            Monthly · Percent of revenue · YTD totals on right
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            fontFamily: FONTS.sans.family,
            fontSize: 11,
            whiteSpace: 'nowrap',
            alignItems: 'baseline',
            fontVariantNumeric: 'tabular-nums lining-nums',
            flexWrap: isMobile ? 'wrap' : undefined,
          }}
        >
          {series.map((s) => (
            <div key={s.shortName} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <div
                style={{
                  width: 6,
                  height: 1,
                  background: mapColor(s.slot),
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
                {s.shortName}
              </span>
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  fontFamily: FONTS.data.family,
                  letterSpacing: '-0.005em',
                }}
              >
                {mask(`${s.ytd.toFixed(1)}%`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG chart */}
      <div style={{ position: 'relative', flex: 1, minHeight: isMobile ? 200 : 0, overflow: 'hidden' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Gridlines + y-axis labels */}
          {tickVals.map((tv) => {
            const yy = toY(tv);
            const isZero = Math.abs(tv) < 0.01;
            return (
              <g key={tv}>
                <line
                  x1={padL}
                  y1={yy}
                  x2={padL + cW}
                  y2={yy}
                  strokeDasharray={isZero ? undefined : '4 3'}
                  strokeWidth={isZero ? 1.2 : 1}
                  style={{ stroke: isZero ? 'var(--text-muted)' : 'var(--chart-gridline)' }}
                  opacity={isZero ? 0.5 : 1}
                />
                <text
                  x={padL - 6}
                  y={yy + 3}
                  textAnchor="end"
                  style={{
                    fontFamily: FONTS.label.family,
                    fontSize: isMobile ? 9 : 9,
                    fill: 'var(--text-muted)',
                  }}
                >
                  {tv.toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {labels.map((m, i) => (
            <text
              key={m}
              x={toX(i)}
              y={h - 4}
              textAnchor="middle"
              style={{
                fontFamily: FONTS.label.family,
                fontSize: isMobile ? 9 : 9,
                fill: 'var(--text-muted)',
              }}
            >
              {m}
            </text>
          ))}

          {/* Margin lines */}
          {seriesPoints.map((pts, si) => {
            const visibleCount = Math.ceil(pts.length * animProgress);
            const visiblePts = pts.slice(0, visibleCount);
            if (visiblePts.length < 2) return null;
            return (
              <path
                key={`line-${si}`}
                d={catmullRomPath(visiblePts)}
                fill="none"
                stroke={mapColor(series[si].slot)}
                strokeWidth={si === 0 ? 2 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={si === 2 ? '6 3' : undefined}
              />
            );
          })}

          {/* Data markers + end-of-period value labels */}
          {seriesPoints.map((pts, si) =>
            pts.map((pt, pi) => {
              if (pi >= Math.ceil(pts.length * animProgress)) return null;
              const isActive =
                tooltip &&
                tooltip.x === pt.x &&
                tooltip.y === pt.y &&
                tooltip.seriesName === series[si].name;
              const color = mapColor(series[si].slot);
              return (
                <circle
                  key={`pt-${si}-${pi}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 3.5 : 1.8}
                  fill={color}
                  stroke="var(--bg-deep)"
                  strokeWidth={1.5}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={() =>
                    setTooltip({
                      x: pt.x,
                      y: pt.y,
                      value: pt.value,
                      month: labels[pi],
                      color,
                      seriesName: series[si].name,
                    })
                  }
                />
              );
            }),
          )}

          {/* End-of-period labels (rightmost visible point per series) */}
          {series.map((s, si) => {
            const lastIdx = s.data.length - 1;
            const pt = seriesPoints[si][lastIdx];
            return (
              <text
                key={`lbl-${si}`}
                x={pt.x - 4}
                y={pt.y - 6}
                textAnchor="end"
                style={{
                  fontFamily: FONTS.data.family,
                  fontSize: 9,
                  fill: mapColor(s.slot),
                  fontWeight: 600,
                }}
              >
                {mask(`${s.data[lastIdx].toFixed(1)}%`)}
              </text>
            );
          })}

          {/* Crosshair tooltip */}
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
                width={120}
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
                {tooltip.month} · {tooltip.seriesName}: {tooltip.value.toFixed(1)}%
              </text>
            </>
          )}
        </svg>
      </div>

      <PanelFootnote
        notes={[
          'GM% = (Revenue − COGS) ÷ Revenue',
          'EBITDA margin reported pre-interest per Ind-AS 1',
          'PAT% dashed — Tally books no monthly tax provision under §115BAA',
        ]}
      />
    </div>
  );
}

// ── Revenue vs EBITDA Supporting Chart ──────────────────────────────────────

function RevenueEBITDAChart() {
  const { period } = useDashboard();
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();
  const mask = useMaskedValue();

  const rev = aggregate(monthlyRevenue, period);
  const ebitda = aggregate(monthlyEBITDA, period);
  const labels = periodLabels(period);

  // Anti-drift YTD — single /100 conversion from Lakhs source
  const ytdRevCr = monthlyRevenue.reduce((a, b) => a + b, 0) / LAKHS_PER_CRORE;
  const ytdEbitdaCr = monthlyEBITDA.reduce((a, b) => a + b, 0) / LAKHS_PER_CRORE;

  const allVals = [...rev, ...ebitda];
  const minVal = Math.min(0, ...allVals) * 1.1;
  const maxVal = Math.max(...allVals) * 1.18;
  const range = maxVal - minVal || 1;

  const w = 880;
  const h = isMobile ? 200 : 240;
  const padL = 44;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(28, (cW / labels.length) * 0.55);
  const zeroY = padT + cH - ((0 - minVal) / range) * cH;

  const toY = (v: number) => padT + cH - ((v - minVal) / range) * cH;

  const linePoints = ebitda.map((v, i) => ({
    x: padL + ((i + 0.5) / labels.length) * cW,
    y: toY(v),
  }));
  const linePath = catmullRomPath(linePoints);

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

  const revColor = mapColor('#00FFCC');
  const ebitdaColor = mapColor('#FF9F0A');

  return (
    <div
      className="fade-in-up"
      style={{
        ...panelFrame,
        animationDelay: '0.3s',
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
            Revenue and EBITDA
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
            Monthly bars · EBITDA overlay · ₹ Crores
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            fontFamily: FONTS.sans.family,
            fontSize: 11,
            whiteSpace: 'nowrap',
            alignItems: 'baseline',
            fontVariantNumeric: 'tabular-nums lining-nums',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <div style={{ width: 6, height: 8, background: revColor, alignSelf: 'center', opacity: 0.45 }} />
            <span style={{ color: 'var(--text-muted)', fontFamily: FONTS.caption.family, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Revenue
            </span>
            <span style={{ color: 'var(--text-primary)', fontFamily: FONTS.data.family, fontWeight: 500 }}>
              {mask(`₹${ytdRevCr.toFixed(2)} Cr`)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <div style={{ width: 6, height: 1, background: ebitdaColor, alignSelf: 'center' }} />
            <span style={{ color: 'var(--text-muted)', fontFamily: FONTS.caption.family, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              EBITDA
            </span>
            <span
              style={{
                color: ytdEbitdaCr >= 0 ? 'var(--text-primary)' : 'var(--accent-coral)',
                fontFamily: FONTS.data.family,
                fontWeight: 500,
              }}
            >
              {mask(`₹${ytdEbitdaCr.toFixed(2)} Cr`)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: isMobile ? 180 : 0, overflow: 'hidden' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
        >
          {/* Gridlines */}
          {tickVals.map((tv) => {
            const yy = toY(tv);
            const isZero = Math.abs(tv) < 0.01;
            return (
              <g key={tv}>
                <line
                  x1={padL}
                  y1={yy}
                  x2={padL + cW}
                  y2={yy}
                  strokeDasharray={isZero ? undefined : '4 3'}
                  strokeWidth={isZero ? 1.2 : 1}
                  style={{ stroke: isZero ? 'var(--text-muted)' : 'var(--chart-gridline)' }}
                  opacity={isZero ? 0.5 : 1}
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

          {/* Zero baseline */}
          <line
            x1={padL}
            y1={zeroY}
            x2={padL + cW}
            y2={zeroY}
            strokeWidth={1}
            style={{ stroke: 'var(--text-muted)' }}
            opacity={0.5}
          />

          {/* Revenue bars */}
          {rev.map((v, i) => {
            const cx = padL + ((i + 0.5) / labels.length) * cW;
            const barH = Math.abs(v / range) * cH;
            const barY = v >= 0 ? toY(v) : zeroY;
            return (
              <rect
                key={`bar-${i}`}
                x={cx - barW / 2}
                y={barY}
                width={barW}
                height={barH}
                fill={revColor}
                opacity={0.42}
              />
            );
          })}

          {/* EBITDA line */}
          <path
            d={linePath}
            stroke={ebitdaColor}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* EBITDA markers */}
          {linePoints.map((p, i) => (
            <circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={2}
              fill={ebitda[i] < 0 ? 'var(--accent-coral)' : ebitdaColor}
              stroke="var(--bg-deep)"
              strokeWidth={1}
            />
          ))}

          {/* X axis labels */}
          {labels.map((m, i) => (
            <text
              key={m}
              x={padL + ((i + 0.5) / labels.length) * cW}
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
          'Revenue = Tally Sales Accounts period activity',
          'EBITDA on Ind-AS basis — pre-interest, pre-tax, pre-depreciation',
          'Mar-26 dip: exam season revenue pull-in to Jan-Feb',
        ]}
      />
    </div>
  );
}

// ── Main P&L Page ───────────────────────────────────────────────────────────

export default function PnlPage() {
  const { period } = useDashboard();
  const { isMobile } = useBreakpoint();

  const totalPBT = sumArr(monthlyPBT) / LAKHS_PER_CRORE;
  const estTaxProvision = totalPBT > 0 ? +(totalPBT * STATUTORY_TAX_RATE).toFixed(2) : 0;
  const estPat = +(totalPBT - estTaxProvision).toFixed(2);
  const taxRatePct = (STATUTORY_TAX_RATE * 100).toFixed(2);

  const labels = periodLabels(period);
  const tableHeaders = ['Account', ...labels, 'YTD'];
  const tableRows: EditorialDataRow[] = pnlStructure.map((row) => ({
    label: row.label,
    values: aggregate(row.monthly, period),
    ytd: row.ytd,
    bold: row.bold,
    indent: row.indent,
    highlight: row.highlight,
    pctRow: row.pctRow,
    section: row.section,
    children: row.children?.map((c) => ({
      label: c.label,
      values: aggregate(c.monthly, period),
      ytd: c.ytd,
      indent: true,
    })),
  }));

  return (
    <EditorialPageShell
      title="P&L performance"
      eyebrow="Route · P&L · FY 2025-26 · Reconciled to Tally group-level TB"
    >
      <PnlHero />

      <hr className="rule rule--thick" style={{ margin: 0 }} />

      <MarginTrendChart />

      <hr className="rule" style={{ margin: 0 }} />

      <RevenueEBITDAChart />

      <hr className="rule" style={{ margin: 0 }} />

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
            Line items
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
            Tally group-level ledgers · Ind-AS waterfall order
          </div>
        </div>

        <EditorialDataTable
          headers={tableHeaders}
          rows={tableRows}
          formatValue={(v) => formatCr(v)}
          defaultOpen
          toggleLabel="View line items"
        />

        <PanelFootnote
          notes={[
            `Income Tax booked at year-end close — currently ₹0 in Tally`,
            `Statutory §115BAA rate ${taxRatePct}% · Est. provision ₹${estTaxProvision.toFixed(2)} Cr on PBT ₹${totalPBT.toFixed(2)} Cr`,
            `Est. post-tax PAT ₹${estPat.toFixed(2)} Cr — this is the number the audited P&L will report`,
          ]}
        />
      </div>
    </EditorialPageShell>
  );
}
