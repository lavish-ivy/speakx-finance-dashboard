import { useState } from 'react';
import { motion } from 'framer-motion';
// Note: motion.path is used in both RevenueEBITDAChart and MarginTrendChart.
import PageShell from './PageShell';
import SectionHeader from '../sections/SectionHeader';
import GlassCard from '../shared/GlassCard';
import KPIBar from '../shared/KPIBar';
import DataTable, { type DataRow } from '../shared/DataTable';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyRevenue, monthlyEBITDA, monthlyPAT, monthlyOperatingExpenses,
  monthlyGrossProfit, monthlyFinanceCosts, monthlyPBT,
  STATUTORY_TAX_RATE,
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

// ── Margin Trend Chart (GM%, EBITDA%, PAT%) ────────────────────────────────
// Three-line margin trend over the selected period. For a B2C ed-tech
// investor deck this is the single highest-signal P&L visual: it tells the
// reader in one glance whether unit economics (GM%), operating leverage
// (EBITDA%), and bottom line (PAT%) are trending up or down. Much more
// useful than a raw PAT-in-Lakhs bar chart, which just duplicates the KPI
// tile.

function MarginTrendChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const rev = aggregate(monthlyRevenue, period);
  const gp = aggregate(monthlyGrossProfit, period);
  const ebitda = aggregate(monthlyEBITDA, period);
  const pat = aggregate(monthlyPAT, period);
  const labels = periodLabels(period);

  // Margin % series — divide-by-zero safe (early FY months can have zero rev).
  const gmPct = rev.map((r, i) => r === 0 ? 0 : +(gp[i] / r * 100).toFixed(1));
  const ebitdaPct = rev.map((r, i) => r === 0 ? 0 : +(ebitda[i] / r * 100).toFixed(1));
  const patPct = rev.map((r, i) => r === 0 ? 0 : +(pat[i] / r * 100).toFixed(1));

  // YTD margins use Lakhs source with single /100 conversion for display
  // parity with the KPI strip (same anti-drift pattern as RevenueEBITDAChart).
  const ytdRev = monthlyRevenue.reduce((a, b) => a + b, 0);
  const ytdGP = monthlyGrossProfit.reduce((a, b) => a + b, 0);
  const ytdEB = monthlyEBITDA.reduce((a, b) => a + b, 0);
  const ytdPAT = monthlyPAT.reduce((a, b) => a + b, 0);
  const ytdGMPct = ytdRev === 0 ? 0 : (ytdGP / ytdRev * 100);
  const ytdEBPct = ytdRev === 0 ? 0 : (ytdEB / ytdRev * 100);
  const ytdPATPct = ytdRev === 0 ? 0 : (ytdPAT / ytdRev * 100);

  const allVals = [...gmPct, ...ebitdaPct, ...patPct];
  const rawMin = Math.min(0, ...allVals);
  const rawMax = Math.max(...allVals);
  // Add headroom so labels don't clip the top; widen by 10pp when range is tiny.
  const span = Math.max(rawMax - rawMin, 10);
  const minVal = rawMin - span * 0.1;
  const maxVal = rawMax + span * 0.15;
  const range = maxVal - minVal || 1;

  const w = 440;
  const h = 180;
  const padL = 42;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;

  const toX = (i: number) => padL + (i + 0.5) / labels.length * cW;
  const toY = (v: number) => padT + cH - ((v - minVal) / range) * cH;

  const series = [
    { name: 'GM%', color: '#00FFCC', data: gmPct, ytd: ytdGMPct },
    { name: 'EBITDA%', color: '#FF9F0A', data: ebitdaPct, ytd: ytdEBPct },
    { name: 'PAT%', color: '#BF5AF2', data: patPct, ytd: ytdPATPct },
  ];

  const buildPath = (data: number[]): string => {
    const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }));
    return catmullRomPath(pts);
  };

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

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
          Margin Trend
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}>
          {series.map((s) => (
            <span key={s.name} style={{ color: s.color }}>
              {mask(`${s.name} ${s.ytd.toFixed(1)}%`)}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 4, flexShrink: 0 }}>
        {series.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 2, background: s.color, borderRadius: 1 }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>{s.name}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          {/* Gridlines + y-axis labels */}
          {tickVals.map((tv) => (
            <g key={tv}>
              <line
                x1={padL}
                y1={toY(tv)}
                x2={padL + cW}
                y2={toY(tv)}
                stroke="var(--chart-gridline)"
                strokeWidth={0.5}
                strokeDasharray={Math.abs(tv) < 0.01 ? undefined : '3,3'}
              />
              <text
                x={padL - 4}
                y={toY(tv) + 3}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize={7}
                fontFamily="'JetBrains Mono', monospace"
              >
                {tv.toFixed(0)}%
              </text>
            </g>
          ))}

          {/* Zero baseline highlighted */}
          {minVal < 0 && maxVal > 0 && (
            <line
              x1={padL}
              y1={toY(0)}
              x2={padL + cW}
              y2={toY(0)}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={1}
            />
          )}

          {/* Margin lines */}
          {series.map((s) => (
            <motion.path
              key={s.name}
              d={buildPath(s.data)}
              stroke={s.color}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              style={{ filter: `drop-shadow(0 0 3px ${s.color}80)` }}
            />
          ))}

          {/* End-of-period value labels */}
          {series.map((s) => {
            const lastIdx = s.data.length - 1;
            return (
              <text
                key={`lbl-${s.name}`}
                x={toX(lastIdx)}
                y={toY(s.data[lastIdx]) - 5}
                textAnchor="end"
                fill={s.color}
                fontSize={7}
                fontFamily="'JetBrains Mono', monospace"
                opacity={0.9}
              >
                {mask(`${s.data[lastIdx].toFixed(1)}%`)}
              </text>
            );
          })}

          {/* X-axis labels */}
          {labels.map((m, i) => (
            <text
              key={m}
              x={toX(i)}
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
  // Operating Expenses = Total Indirect Expenses − Finance Costs. This is
  // the number that flows into the EBITDA derivation on the investor P&L.
  const totalOpex = sumArr(monthlyOperatingExpenses);
  const totalFinCost = sumArr(monthlyFinanceCosts);

  // Estimated tax provision: actual current tax is booked at year-end by
  // the tax advisor (monthlyTax is 0 until then). For a board/investor
  // view we show the provision at the statutory 115BAA rate so readers
  // see a realistic post-tax bottom line instead of a misleading zero-tax
  // PAT. Only applied when PBT is positive (no benefit recognised on losses).
  const totalPBT = sumArr(monthlyPBT);
  const estTaxProvision = totalPBT > 0 ? +(totalPBT * STATUTORY_TAX_RATE).toFixed(2) : 0;
  const estPATPostProvision = +(totalPBT - estTaxProvision).toFixed(2);

  const kpis = [
    { label: 'YTD Revenue', value: formatCr(totalRev), sub: `${totalRev.toFixed(1)} L`, positive: true },
    { label: 'Gross Margin', value: `${((totalGP / totalRev) * 100).toFixed(1)}%`, sub: `GP: ${formatCr(totalGP)}`, positive: true },
    { label: 'EBITDA (YTD)', value: formatCr(totalEBITDA), sub: `Margin: ${((totalEBITDA / totalRev) * 100).toFixed(1)}%`, positive: totalEBITDA > 0, negative: totalEBITDA < 0 },
    { label: 'PAT (YTD)', value: formatCr(totalPAT), sub: `Est. post-tax: ${formatCr(estPATPostProvision)}`, positive: totalPAT > 0, negative: totalPAT < 0 },
    { label: 'Operating Expenses', value: formatCr(totalOpex), sub: `${((totalOpex / totalRev) * 100).toFixed(1)}% of revenue` },
    { label: 'Finance Costs', value: formatCr(totalFinCost), sub: `${((totalFinCost / totalRev) * 100).toFixed(2)}% of revenue`, negative: totalFinCost > 0 },
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
    section: row.section,
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
          <MarginTrendChart />
        </GlassCard>
      </div>

      <div style={{ flexShrink: 0 }}>
        <DataTable
          headers={tableHeaders}
          rows={tableRows}
          formatValue={(v) => formatCr(v)}
        />

        {/* Tax-provision note: explains the 0 booked tax and shows the
            estimated YTD provision at the statutory 115BAA rate so board
            readers don't misinterpret "Income Tax = 0" as a data bug. */}
        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          background: 'rgba(255, 159, 10, 0.06)',
          border: '1px solid rgba(255, 159, 10, 0.2)',
          borderRadius: 6,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.7)',
        }}>
          <div style={{
            fontSize: 8,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#FF9F0A',
            marginBottom: 2,
          }}>
            Note — Tax Provision
          </div>
          Income Tax is booked at year-end close (currently ₹0 in Tally).
          Applying the statutory 115BAA rate of <b>{(STATUTORY_TAX_RATE * 100).toFixed(2)}%</b> to
          YTD PBT of <b>{formatCr(totalPBT)}</b> gives an estimated provision
          of <b style={{ color: '#FF453A' }}>{formatCr(estTaxProvision)}</b>,
          for an estimated post-provision PAT of <b style={{ color: '#00FFCC' }}>{formatCr(estPATPostProvision)}</b>.
        </div>
      </div>
    </PageShell>
  );
}
