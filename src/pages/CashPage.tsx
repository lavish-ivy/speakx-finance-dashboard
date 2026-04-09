import { motion } from 'framer-motion';
import PageShell from './PageShell';
import SectionHeader from '../sections/SectionHeader';
import GlassCard from '../shared/GlassCard';
import KPIBar from '../shared/KPIBar';
import DataTable, { type DataRow } from '../shared/DataTable';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyOCF, monthlyICF, monthlyFCF, monthlyNetCF,
  aggregateCF, cfPeriodLabels, formatCr,
  aggregate, periodLabels,
} from '../data/financialData';
import { cashPositionChart as cpChart } from '../data/mockData';

const sumArr = (a: number[]) => a.reduce((s, v) => s + v, 0);

// ── Catmull-Rom helper ─────────────────────────────────────────────────────

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

// ── Grouped Cash Flow Bar Chart ────────────────────────────────────────────

function CashFlowGroupedChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const ocf = aggregateCF(monthlyOCF, period);
  const icf = aggregateCF(monthlyICF, period);
  const fcf = aggregateCF(monthlyFCF, period);
  const labels = cfPeriodLabels(period);

  const allVals = [...ocf, ...icf, ...fcf];
  const maxAbs = Math.max(...allVals.map(Math.abs)) * 1.15 || 1;

  const w = 440;
  const h = 220;
  const padL = 50;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const groupW = cW / labels.length;
  const barW = Math.min(10, groupW * 0.2);
  const zeroY = padT + cH / 2;

  const toY = (v: number) => zeroY - (v / maxAbs) * (cH / 2);

  const series = [
    { label: 'Operating CF', color: '#00FFCC', data: ocf },
    { label: 'Investing CF', color: '#FF9F0A', data: icf },
    { label: 'Financing CF', color: '#64D2FF', data: fcf },
  ];

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
        Cash Flow Components
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
        {series.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {/* Zero line */}
        <line x1={padL} y1={zeroY} x2={padL + cW} y2={zeroY} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

        {/* Y axis labels */}
        {[-1, -0.5, 0, 0.5, 1].map((frac) => {
          const val = frac * maxAbs;
          const yy = toY(val);
          return (
            <g key={frac}>
              <line x1={padL} y1={yy} x2={padL + cW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.3} />
              <text x={padL - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={6} fontFamily="'JetBrains Mono', monospace">
                {mask(formatCr(val))}
              </text>
            </g>
          );
        })}

        {/* Grouped bars */}
        {labels.map((_, i) => {
          const groupCx = padL + (i + 0.5) * groupW;
          return (
            <g key={i}>
              {series.map((s, si) => {
                const v = s.data[i];
                const barH = Math.abs(v / maxAbs) * (cH / 2);
                const barY = v >= 0 ? toY(v) : zeroY;
                const xOff = (si - 1) * (barW + 2);
                return (
                  <motion.rect
                    key={si}
                    x={groupCx + xOff - barW / 2}
                    y={barY}
                    width={barW}
                    height={barH}
                    rx={1.5}
                    fill={s.color}
                    opacity={0.8}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: i * 0.04 + si * 0.02, duration: 0.4 }}
                  />
                );
              })}
            </g>
          );
        })}

        {/* X labels */}
        {labels.map((m, i) => (
          <text key={m} x={padL + (i + 0.5) * groupW} y={h - 4} textAnchor="middle"
            fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Total Liquidity Trend Line ─────────────────────────────────────────────

function LiquidityTrendChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();

  // Total liquidity from mockData (already in Crores — convert to Lakhs for consistency)
  const liquidityLakhs = cpChart.totalLiquidity.map((v) => v * 100);
  const data = aggregate(liquidityLakhs, period, true);
  const labels = periodLabels(period);

  const minVal = Math.min(...data) * 0.9;
  const maxVal = Math.max(...data) * 1.05;
  const range = maxVal - minVal || 1;

  const w = 440;
  const h = 180;
  const padL = 50;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;

  const points = data.map((v, i) => ({
    x: padL + (i / Math.max(1, data.length - 1)) * cW,
    y: padT + cH - ((v - minVal) / range) * cH,
  }));

  const linePath = catmullRomPath(points);
  const areaPath = `${linePath} L${points[points.length - 1].x},${padT + cH} L${points[0].x},${padT + cH} Z`;

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

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
        Total Liquidity Trend
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="liqAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BF5AF2" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#BF5AF2" stopOpacity={0.03} />
          </linearGradient>
          <filter id="liqGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {tickVals.map((tv) => {
          const yy = padT + cH - ((tv - minVal) / range) * cH;
          return (
            <g key={tv}>
              <line x1={padL} y1={yy} x2={padL + cW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padL - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={6} fontFamily="'JetBrains Mono', monospace">
                {mask(formatCr(tv))}
              </text>
            </g>
          );
        })}

        <motion.path d={areaPath} fill="url(#liqAreaGrad)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />

        <motion.path d={linePath} stroke="#BF5AF2" strokeWidth={2.5} fill="none" strokeLinecap="round"
          filter="url(#liqGlow)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }} />

        {points.map((p, i) => (
          <motion.circle key={i} cx={p.x} cy={p.y} r={3} fill="#BF5AF2"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05, duration: 0.2 }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(191,90,242,0.5))' }} />
        ))}

        {labels.map((m, i) => (
          <text key={m} x={padL + (i / Math.max(1, labels.length - 1)) * cW} y={h - 4} textAnchor="middle"
            fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Main Cash Page ─────────────────────────────────────────────────────────

export default function CashPage() {
  const { period } = useDashboard();
  const { isMobile } = useBreakpoint();

  const totalOCF = sumArr(monthlyOCF);
  const totalICF = sumArr(monthlyICF);
  const totalFCF = sumArr(monthlyFCF);
  const totalNetCF = sumArr(monthlyNetCF);

  // Latest liquidity from mockData (Crores)
  const latestLiquidity = cpChart.totalLiquidity[11];
  const latestBank = cpChart.bankBalance[11];

  const kpis = [
    { label: 'Operating CF (YTD)', value: formatCr(totalOCF), sub: `${totalOCF.toFixed(1)} L`, positive: totalOCF > 0, negative: totalOCF < 0 },
    { label: 'Investing CF (YTD)', value: formatCr(totalICF), sub: `${totalICF.toFixed(1)} L`, negative: totalICF < 0 },
    { label: 'Financing CF (YTD)', value: formatCr(totalFCF), sub: `${totalFCF.toFixed(1)} L`, negative: totalFCF < 0 },
    { label: 'Net Cash Flow', value: formatCr(totalNetCF), sub: `${totalNetCF.toFixed(1)} L`, positive: totalNetCF > 0, negative: totalNetCF < 0 },
    { label: 'Total Liquidity', value: `₹${latestLiquidity.toFixed(1)} Cr`, sub: 'Bank + Investments', positive: true },
    { label: 'Bank Balance', value: `₹${latestBank.toFixed(1)} Cr`, sub: `${(latestBank * 100).toFixed(1)} L` },
  ];

  const cfLabels = cfPeriodLabels(period);
  const tableHeaders = ['Component', ...cfLabels, 'YTD'];

  const cfRows: DataRow[] = [
    { label: 'Operating CF', values: aggregateCF(monthlyOCF, period), ytd: totalOCF, bold: false },
    { label: 'Investing CF', values: aggregateCF(monthlyICF, period), ytd: totalICF, bold: false },
    { label: 'Financing CF', values: aggregateCF(monthlyFCF, period), ytd: totalFCF, bold: false },
    { label: 'Net Cash Flow', values: aggregateCF(monthlyNetCF, period), ytd: totalNetCF, bold: true, highlight: true },
  ];

  return (
    <PageShell>
      <SectionHeader title="CASH FLOW & LIQUIDITY" />
      <KPIBar items={kpis} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 12,
        marginBottom: 14,
      }}>
        <GlassCard>
          <CashFlowGroupedChart />
        </GlassCard>
        <GlassCard delay={0.1}>
          <LiquidityTrendChart />
        </GlassCard>
      </div>

      <DataTable
        headers={tableHeaders}
        rows={cfRows}
        formatValue={(v) => formatCr(v)}
      />
    </PageShell>
  );
}
