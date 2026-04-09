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
  opexChartSeries, pnlStructure,
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

  // EBITDA line points
  const linePoints = ebitda.map((v, i) => ({
    x: padL + (i + 0.5) / labels.length * cW,
    y: toY(v),
  }));
  const linePath = catmullRomPath(linePoints);

  // Y-axis ticks
  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        Revenue vs EBITDA
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#00FFCC', opacity: 0.7 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>Revenue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 2, background: '#FF9F0A', borderRadius: 1 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>EBITDA</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
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

        {/* Grid lines */}
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

        {/* Zero line */}
        <line x1={padL} y1={zeroY} x2={padL + cW} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="3,3" />

        {/* Revenue bars */}
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

        {/* EBITDA line */}
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

        {/* EBITDA dots + labels */}
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

        {/* Tooltip */}
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

        {/* X labels */}
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
  );
}

// ── PAT Bar Chart ──────────────────────────────────────────────────────────

function PATChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const pat = aggregate(monthlyPAT, period);
  const labels = periodLabels(period);

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
    <div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        Profit After Tax
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {/* Zero line */}
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
              {/* Value label */}
              <text
                x={cx}
                y={v >= 0 ? barY - 4 : barY + barH + 10}
                textAnchor="middle"
                fill={fillColor}
                fontSize={7}
                fontFamily="'JetBrains Mono', monospace"
                opacity={0.8}
              >
                {mask(formatCr(v))}
              </text>
            </g>
          );
        })}

        {/* X labels */}
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
  );
}

// ── OpEx Stacked Bar Chart ─────────────────────────────────────────────────

function OpExStackedChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const labels = periodLabels(period);

  // Aggregate each series
  const series = opexChartSeries.map((s) => ({
    ...s,
    data: aggregate(s.data, period),
  }));

  // Calculate stacked totals per period
  const stacked: number[][] = labels.map((_, i) =>
    series.map((s) => s.data[i])
  );
  const maxTotal = Math.max(...stacked.map((s) => s.reduce((a, b) => a + b, 0))) * 1.1 || 1;

  const w = 440;
  const h = 200;
  const padL = 42;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(28, cW / labels.length * 0.6);

  // Y-axis ticks
  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => (maxTotal / (ticks - 1)) * i);

  const toY = (v: number) => padT + cH - (v / maxTotal) * cH;

  return (
    <div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        OpEx Breakdown
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
        {series.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: 1, background: s.color }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {/* Grid */}
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

        {/* Stacked bars */}
        {labels.map((_, colIdx) => {
          let cumY = 0;
          const cx = padL + (colIdx + 0.5) / labels.length * cW;
          const total = series.reduce((acc, s) => acc + s.data[colIdx], 0);
          return (
            <g key={colIdx}>
              {series.map((s, sIdx) => {
                const segH = (s.data[colIdx] / maxTotal) * cH;
                const segY = toY(cumY + s.data[colIdx]);
                cumY += s.data[colIdx];
                return (
                  <rect
                    key={sIdx}
                    x={cx - barW / 2}
                    y={segY}
                    width={barW}
                    height={segH}
                    fill={s.color}
                    rx={sIdx === series.length - 1 ? 2 : 0}
                    opacity={0.8}
                  />
                );
              })}
              {/* Total label on top of stack */}
              <text
                x={cx}
                y={toY(total) - 3}
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize={6}
                fontFamily="'JetBrains Mono', monospace"
                opacity={0.8}
              >
                {mask(formatCr(total))}
              </text>
            </g>
          );
        })}

        {/* X labels */}
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

  // Build table rows from pnlStructure
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
        gap: 12,
        marginBottom: 14,
      }}>
        <GlassCard>
          <RevenueEBITDAChart />
        </GlassCard>
        <GlassCard delay={0.1}>
          <PATChart />
        </GlassCard>
      </div>

      <GlassCard delay={0.15} style={{ marginBottom: 14 }}>
        <OpExStackedChart />
      </GlassCard>

      <DataTable
        headers={tableHeaders}
        rows={tableRows}
        formatValue={(v) => formatCr(v)}
      />
    </PageShell>
  );
}
