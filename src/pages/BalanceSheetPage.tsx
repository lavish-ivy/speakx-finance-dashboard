import { motion } from 'framer-motion';
import PageShell from './PageShell';
import SectionHeader from '../sections/SectionHeader';
import GlassCard from '../shared/GlassCard';
import KPIBar from '../shared/KPIBar';
import DataTable, { type DataRow } from '../shared/DataTable';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyNCA, monthlyCA, monthlyEquity, monthlyNCL, monthlyCL,
  monthlyTotalAssets, aggregate, periodLabels, formatCr,
} from '../data/financialData';
import { assetComposition } from '../data/mockData';

// ── Stacked Asset Chart (NCA + CA) ─────────────────────────────────────────

function AssetChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const nca = aggregate(monthlyNCA, period, true);
  const ca = aggregate(monthlyCA, period, true);
  const labels = periodLabels(period);
  const totals = nca.map((n, i) => n + ca[i]);
  const maxTotal = Math.max(...totals) * 1.15 || 1;

  const w = 440;
  const h = 200;
  const padL = 50;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(28, cW / labels.length * 0.6);
  const toY = (v: number) => padT + cH - (v / maxTotal) * cH;

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => (maxTotal / (ticks - 1)) * i);

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
        Total Assets (NCA + CA)
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
        {[
          { label: 'Non-Current Assets', color: '#00FFCC' },
          { label: 'Current Assets', color: '#39FF14' },
        ].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {tickVals.map((tv) => (
          <g key={tv}>
            <line x1={padL} y1={toY(tv)} x2={padL + cW} y2={toY(tv)} stroke="var(--chart-gridline)" strokeWidth={0.5} />
            <text x={padL - 4} y={toY(tv) + 3} textAnchor="end" fill="var(--text-muted)" fontSize={6} fontFamily="'JetBrains Mono', monospace">
              {mask(formatCr(tv))}
            </text>
          </g>
        ))}

        {labels.map((_, i) => {
          const cx = padL + (i + 0.5) / labels.length * cW;
          const ncaH = (nca[i] / maxTotal) * cH;
          const caH = (ca[i] / maxTotal) * cH;
          const ncaY = toY(nca[i]);
          const caY = ncaY - caH;
          return (
            <g key={i}>
              <motion.rect x={cx - barW / 2} y={ncaY} width={barW} height={ncaH} fill="#00FFCC" opacity={0.7} rx={0}
                initial={{ height: 0, y: padT + cH }} animate={{ height: ncaH, y: ncaY }}
                transition={{ delay: i * 0.04, duration: 0.5 }} />
              <motion.rect x={cx - barW / 2} y={caY} width={barW} height={caH} fill="#39FF14" opacity={0.7} rx={2}
                initial={{ height: 0, y: ncaY }} animate={{ height: caH, y: caY }}
                transition={{ delay: i * 0.04 + 0.1, duration: 0.5 }} />
            </g>
          );
        })}

        {labels.map((m, i) => (
          <text key={m} x={padL + (i + 0.5) / labels.length * cW} y={h - 4} textAnchor="middle"
            fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Equity & Liabilities Stacked Chart ─────────────────────────────────────

function LiabilitiesChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const eq = aggregate(monthlyEquity, period, true);
  const ncl = aggregate(monthlyNCL, period, true);
  const cl = aggregate(monthlyCL, period, true);
  const labels = periodLabels(period);
  const totals = eq.map((e, i) => e + ncl[i] + cl[i]);
  const maxTotal = Math.max(...totals) * 1.1 || 1;

  const w = 440;
  const h = 200;
  const padL = 50;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(28, cW / labels.length * 0.6);
  const toY = (v: number) => padT + cH - (v / maxTotal) * cH;

  const colorMap = [
    { label: 'Equity', color: '#64D2FF' },
    { label: 'NCL', color: '#BF5AF2' },
    { label: 'Current Liab.', color: '#FF9F0A' },
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
        Equity & Liabilities
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
        {colorMap.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {labels.map((_, i) => {
          const cx = padL + (i + 0.5) / labels.length * cW;
          const vals = [eq[i], ncl[i], cl[i]];
          const colors = ['#64D2FF', '#BF5AF2', '#FF9F0A'];
          let cumH = 0;
          return (
            <g key={i}>
              {vals.map((v, si) => {
                const segH = (v / maxTotal) * cH;
                const segY = toY(cumH + v);
                cumH += v;
                return (
                  <motion.rect key={si} x={cx - barW / 2} y={segY} width={barW} height={segH}
                    fill={colors[si]} opacity={0.7} rx={si === vals.length - 1 ? 2 : 0}
                    initial={{ height: 0, y: padT + cH }} animate={{ height: segH, y: segY }}
                    transition={{ delay: i * 0.04 + si * 0.02, duration: 0.5 }} />
                );
              })}
            </g>
          );
        })}

        {labels.map((m, i) => (
          <text key={m} x={padL + (i + 0.5) / labels.length * cW} y={h - 4} textAnchor="middle"
            fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Asset Donut (from existing data) ───────────────────────────────────────

function AssetDonut() {
  const mask = useMaskedValue();
  const total = assetComposition.segments.reduce((s, seg) => s + seg.value, 0);
  const radius = 55;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius;
  const cx = 75;
  const cy = 75;
  const gapLen = (2 / 360) * circumference;

  let accumulated = 0;
  const arcs = assetComposition.segments.map((seg) => {
    const pct = seg.value / total;
    const dashLen = Math.max(0, pct * circumference - gapLen);
    const dashOffset = -(accumulated / total) * circumference;
    accumulated += seg.value;
    return { ...seg, pct, dashLen, dashOffset };
  });

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
        Asset Composition
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={150} height={150}>
          {arcs.map((a, i) => (
            <motion.circle
              key={a.label}
              cx={cx} cy={cy} r={radius} fill="none"
              stroke={a.color} strokeWidth={strokeWidth}
              strokeDasharray={`${a.dashLen} ${circumference - a.dashLen}`}
              strokeDashoffset={a.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
            />
          ))}
          <text x={cx} y={cy - 2} textAnchor="middle" fill="var(--text-primary)" fontSize={11}
            fontFamily="'JetBrains Mono', monospace" fontWeight={700}>
            {mask(assetComposition.centerLabel)}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize={7} fontFamily="'Inter', sans-serif">
            Total Assets
          </text>
        </svg>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 6 }}>
          {arcs.map((a) => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: a.color }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>
                {a.label} {(a.pct * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Balance Sheet Page ────────────────────────────────────────────────

export default function BalanceSheetPage() {
  const { period } = useDashboard();
  const { isMobile } = useBreakpoint();

  // Latest month values (Mar26)
  const latestTA = monthlyTotalAssets[11];
  const latestNCA = monthlyNCA[11];
  const latestCA = monthlyCA[11];
  const latestEq = monthlyEquity[11];
  const latestCL = monthlyCL[11];
  const latestNCL = monthlyNCL[11];

  const kpis = [
    { label: 'Total Assets', value: formatCr(latestTA), sub: `${latestTA.toFixed(1)} L`, positive: true },
    { label: 'Investments (NCA)', value: formatCr(latestNCA), sub: `${((latestNCA / latestTA) * 100).toFixed(1)}% of assets` },
    { label: 'Total Equity', value: formatCr(latestEq), sub: `${latestEq.toFixed(1)} L`, positive: true },
    { label: 'Current Liabilities', value: formatCr(latestCL), sub: `${latestCL.toFixed(1)} L`, negative: true },
    { label: 'Current Assets', value: formatCr(latestCA), sub: `${latestCA.toFixed(1)} L` },
    { label: 'Debt/Equity', value: `${((latestNCL / latestEq) * 100).toFixed(2)}%`, sub: 'Near zero leverage', positive: true },
  ];

  const labels = periodLabels(period);
  const tableHeaders = ['Item', ...labels];

  const bsRows: DataRow[] = [
    { label: 'Non-Current Assets', values: aggregate(monthlyNCA, period, true), bold: true },
    { label: 'Current Assets', values: aggregate(monthlyCA, period, true), bold: false },
    { label: 'Total Assets', values: aggregate(monthlyTotalAssets, period, true), bold: true, highlight: true },
    { label: 'Equity', values: aggregate(monthlyEquity, period, true), bold: true },
    { label: 'Non-Current Liabilities', values: aggregate(monthlyNCL, period, true), bold: false },
    { label: 'Current Liabilities', values: aggregate(monthlyCL, period, true), bold: false },
    {
      label: 'Total E&L',
      values: aggregate(monthlyEquity, period, true).map((e, i) =>
        +(e + aggregate(monthlyNCL, period, true)[i] + aggregate(monthlyCL, period, true)[i]).toFixed(2)
      ),
      bold: true,
      highlight: true,
    },
  ];

  return (
    <PageShell>
      <SectionHeader title="BALANCE SHEET" />
      <KPIBar items={kpis} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 12,
        marginBottom: 14,
      }}>
        <GlassCard>
          <AssetChart />
        </GlassCard>
        <GlassCard delay={0.1}>
          <LiabilitiesChart />
        </GlassCard>
      </div>

      <GlassCard delay={0.15} style={{ marginBottom: 14 }}>
        <AssetDonut />
      </GlassCard>

      <DataTable
        headers={tableHeaders}
        rows={bsRows}
        formatValue={(v) => formatCr(v)}
      />
    </PageShell>
  );
}
