import { useState } from 'react';
import { motion } from 'framer-motion';
import PageShell from './PageShell';
import SectionHeader from '../sections/SectionHeader';
import GlassCard from '../shared/GlassCard';
import KPIBar from '../shared/KPIBar';
import DataTable, { type DataRow } from '../shared/DataTable';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyRevenue, monthlyEBITDA, monthlyPAT, monthlyTotalOpex,
  monthlyGrossProfit, monthlyOtherIncome,
  pnlStructure,
  aggregate, periodLabels, formatCr,
} from '../data/financialData';

const sumArr = (a: number[]) => a.reduce((s, v) => s + v, 0);

// ── SVG Chart Helpers ──────────────────────────────────────────────────────

function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

// ── Revenue vs EBITDA Combo Chart ──────────────────────────────────────────

function RevenueEBITDAChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const rev = aggregate(monthlyRevenue, period);
  const ebitda = aggregate(monthlyEBITDA, period);
  const labels = periodLabels(period);

  // YTDs are computed from the Lakhs source with a single /100 conversion so
  // they match the authoritative KPI totals (no "sum of 2dp Cr bars" drift).
  const ytdRevCr = monthlyRevenue.reduce((a, b) => a + b, 0) / 100;
  const ytdEbitdaCr = monthlyEBITDA.reduce((a, b) => a + b, 0) / 100;

  const allVals = [...rev, ...ebitda];
  const minVal = Math.min(0, ...allVals) * 1.1;
  const maxVal = Math.max(...allVals) * 1.15;
  const range = maxVal - minVal || 1;

  const w = 440;
  const h = 200;
  const padL = 42;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(28, cW / labels.length * 0.6);
  const zeroY = padT + cH - ((0 - minVal) / range) * cH;

  const toY = (v: number) => padT + cH - ((v - minVal) / range) * cH;

  const linePoints = ebitda.map((v, i) => ({
    x: padL + (i + 0.5) / labels.length * cW,
    y: toY(v),
  }));
  const linePath = catmullRomPath(linePoints);

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 4,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Revenue vs EBITDA
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: '#00FFCC' }}>
            {mask(`REV ₹${ytdRevCr.toFixed(2)} Cr`)}
          </span>
          <span style={{ color: ytdEbitdaCr >= 0 ? '#FF9F0A' : '#FF453A' }}>
            {mask(`EBITDA ₹${ytdEbitdaCr.toFixed(2)} Cr`)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 4, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#00FFCC', opacity: 0.7 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>Revenue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 2, background: '#FF9F0A', borderRadius: 1 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>EBITDA</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFCC" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#00FFCC" stopOpacity={0.4} />
            </linearGradient>
            <filter id="ebitdaGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {tickVals.map((tv) => {
            const yy = toY(tv);
            return (
              <g key={tv}>
                <line x1={padL} y1={yy} x2={padL + cW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.5} />
                <text x={padL - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">
                  {mask(formatCr(tv))}
                </text>
              </g>
            );
          })}

          <line x1={padL} y1={zeroY} x2={padL + cW} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="3,3" />

          {rev.map((v, i) => {
            const cx = padL + (i + 0.5) / labels.length * cW;
            const barH = Math.abs(v / range) * cH;
            const barY = v >= 0 ? toY(v) : zeroY;
            return (
              <g key={`bar-${i}`}>
                <rect
                  x={cx - barW / 2}
                  y={barY}
                  width={barW}
                  height={barH}
                  rx={2}
                  fill="url(#revBarGrad)"
                  opacity={hoverIdx === i ? 1 : 0.75}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{ cursor: 'crosshair' }}
                />
                <text
                  x={cx}
                  y={barY - 3}
                  textAnchor="middle"
                  fill="#00FFCC"
                  fontSize={6}
                  fontFamily="'JetBrains Mono', monospace"
                  opacity={0.8}
                >
                  {mask(formatCr(v))}
                </text>
              </g>
            );
          })}

          <motion.path
            d={linePath}
            stroke="#FF9F0A"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            filter="url(#ebitdaGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut', delay: 0.3 }}
          />

          {linePoints.map((p, i) => (
            <g key={`dot-${i}`}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={3}
                fill={ebitda[i] < 0 ? '#FF453A' : '#FF9F0A'}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.2 }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,159,10,0.5))' }}
              />
              <text
                x={p.x}
                y={p.y - 6}
                textAnchor="middle"
                fill={ebitda[i] < 0 ? '#FF453A' : '#FF9F0A'}
                fontSize={6}
                fontFamily="'JetBrains Mono', monospace"
                opacity={0.8}
              >
                {mask(formatCr(ebitda[i]))}
              </text>
            </g>
          ))}

          {hoverIdx !== null && (
            <g>
              <rect
                x={padL + (hoverIdx + 0.5) / labels.length * cW - 38}
                y={toY(rev[hoverIdx]) - 34}
                width={76}
                height={28}
                rx={4}
                fill="rgba(10,12,18,0.9)"
                stroke="rgba(0,255,204,0.2)"
                strokeWidth={0.5}
              />
              <text
                x={padL + (hoverIdx + 0.5) / labels.length * cW}
                y={toY(rev[hoverIdx]) - 22}
                textAnchor="middle"
                fill="#00FFCC"
                fontSize={7}
                fontFamily="'JetBrains Mono', monospace"
              >
                Rev: {mask(formatCr(rev[hoverIdx]))}
              </text>
              <text
                x={padL + (hoverIdx + 0.5) / labels.length * cW}
                y={toY(rev[hoverIdx]) - 12}
                textAnchor="middle"
                fill="#FF9F0A"
                fontSize={7}
                fontFamily="'JetBrains Mono', monospace"
              >
                EBITDA: {mask(formatCr(ebitda[hoverIdx]))}
              </text>
            </g>
          )}

          {labels.map((m, i) => (
            <text
              key={m}
              x={padL + (i + 0.5) / labels.length * cW}
              y={h - 4}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize={7}
              fontFamily="'JetBrains Mono', monospace"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── PAT Bar Chart ──────────────────────────────────────────────────────────

function PATChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const pat = aggregate(monthlyPAT, period);
  const labels = periodLabels(period);

  // YTD is computed from the Lakhs source (single conversion) so it matches
  // the "PAT (YTD)" KPI exactly — avoids the "sum of rounded values" drift
  // that bit us when bar labels were formatted in Cr at 2dp.
  const ytdPatLakhs = monthlyPAT.reduce((a, b) => a + b, 0);
  const ytdPatCr = ytdPatLakhs / 100;

  // Per-bar labels stay in Lakhs — that's the native precision of the source
  // data (financialData.monthlyPAT is 2dp in Lakhs), so each bar label is
  // exact AND the bars sum to the YTD headline without drift. Mixing units on
  // the same page is deliberate: monthly granularity reads naturally in L,
  // the aggregate reads naturally in Cr.
  const formatLakhs = (lakhs: number): string => `₹${lakhs.toFixed(1)} L`;

  const maxAbs = Math.max(...pat.map(Math.abs)) * 1.2 || 1;
  const w = 440;
  const h = 180;
  const padL = 42;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(24, cW / labels.length * 0.55);
  const zeroY = padT + cH / 2;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 4,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Profit After Tax
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: ytdPatCr >= 0 ? '#00FFCC' : '#FF453A',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}>
          {mask(`YTD ₹${ytdPatCr.toFixed(2)} Cr`)}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          <line x1={padL} y1={zeroY} x2={padL + cW} y2={zeroY} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

          {pat.map((v, i) => {
            const cx = padL + (i + 0.5) / labels.length * cW;
            const barH = Math.abs(v) / maxAbs * (cH / 2);
            const barY = v >= 0 ? zeroY - barH : zeroY;
            const fillColor = v >= 0 ? '#00FFCC' : '#FF453A';
            return (
              <g key={i}>
                <rect
                  x={cx - barW / 2}
                  y={barY}
                  width={barW}
                  height={barH}
                  rx={2}
                  fill={fillColor}
                  opacity={0.75}
                />
                <text
                  x={cx}
                  y={v >= 0 ? barY - 4 : barY + barH + 10}
                  textAnchor="middle"
                  fill={fillColor}
                  fontSize={7}
                  fontFamily="'JetBrains Mono', monospace"
                  opacity={0.8}
                >
                  {mask(formatLakhs(v))}
                </text>
              </g>
            );
          })}

          {labels.map((m, i) => (
            <text
              key={m}
              x={padL + (i + 0.5) / labels.length * cW}
              y={h - 4}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize={7}
              fontFamily="'JetBrains Mono', monospace"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Main P&L Page ──────────────────────────────────────────────────────────

export default function PnlPage() {
  const { period } = useDashboard();
  const { isMobile } = useBreakpoint();

  const totalRev = sumArr(monthlyRevenue);
  const totalGP = sumArr(monthlyGrossProfit);
  const totalEBITDA = sumArr(monthlyEBITDA);
  const totalPAT = sumArr(monthlyPAT);
  const totalOpex = sumArr(monthlyTotalOpex);
  const totalOtherInc = sumArr(monthlyOtherIncome);

  const kpis = [
    { label: 'YTD Revenue', value: formatCr(totalRev), sub: `${totalRev.toFixed(1)} L`, positive: true },
    { label: 'Gross Margin', value: `${((totalGP / totalRev) * 100).toFixed(1)}%`, sub: `GP: ${formatCr(totalGP)}`, positive: true },
    { label: 'EBITDA (YTD)', value: formatCr(totalEBITDA), sub: `Margin: ${((totalEBITDA / totalRev) * 100).toFixed(1)}%`, positive: totalEBITDA > 0, negative: totalEBITDA < 0 },
    { label: 'PAT (YTD)', value: formatCr(totalPAT), sub: `${totalPAT.toFixed(1)} L`, positive: totalPAT > 0, negative: totalPAT < 0 },
    { label: 'Total OpEx', value: formatCr(totalOpex), sub: `${((totalOpex / totalRev) * 100).toFixed(1)}% of revenue` },
    { label: 'Other Income', value: formatCr(totalOtherInc), sub: `${totalOtherInc.toFixed(1)} L` },
  ];

  const labels = periodLabels(period);
  const tableHeaders = ['Account', ...labels, 'YTD'];
  const tableRows: DataRow[] = pnlStructure.map((row) => ({
    label: row.label,
    values: aggregate(row.monthly, period),
    ytd: row.ytd,
    bold: row.bold,
    indent: row.indent,
    highlight: row.highlight,
    pctRow: row.pctRow,
    children: row.children?.map((c) => ({
      label: c.label,
      values: aggregate(c.monthly, period),
      ytd: c.ytd,
      indent: true,
    })),
  }));

  return (
    <PageShell>
      <SectionHeader title="P&L PERFORMANCE" />
      <KPIBar items={kpis} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 10,
        marginBottom: 10,
        flex: isMobile ? undefined : 1,
        minHeight: isMobile ? undefined : 0,
      }}>
        <GlassCard>
          <RevenueEBITDAChart />
        </GlassCard>
        <GlassCard delay={0.1}>
          <PATChart />
        </GlassCard>
      </div>

      <div style={{ flexShrink: 0 }}>
        <DataTable
          headers={tableHeaders}
          rows={tableRows}
          formatValue={(v) => formatCr(v)}
        />
      </div>
    </PageShell>
  );
}
