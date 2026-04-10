import { motion } from 'framer-motion';
import PageShell from './PageShell';
import SectionHeader from '../sections/SectionHeader';
import GlassCard from '../shared/GlassCard';
import KPIBar from '../shared/KPIBar';
import DataTable, { type DataRow } from '../shared/DataTable';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyOCF, monthlyICF, monthlyFinancingCF,
  monthlyCapEx, monthlyTreasuryCF, monthlyFreeCashFlow, monthlyNetCF,
  monthlyRevenue, monthlyCOGS, monthlyTotalOpex, monthlyOtherIncome, monthlyTax,
  monthlyCA, monthlyInvestments, monthlyFixedAssets,
  aggregateCF, cfPeriodLabels, formatCr,
  aggregate, periodLabels,
} from '../data/financialData';

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

// ── Nice-number axis helper (symmetric padding, clean ticks) ───────────────

function niceAxis(min: number, max: number, targetTicks = 5): { lo: number; hi: number; ticks: number[] } {
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.1, 1);
    return niceAxis(min - pad, max + pad, targetTicks);
  }
  const span = max - min;
  const rawStep = span / (targetTicks - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step * 0.5; v += step) ticks.push(+v.toFixed(6));
  return { lo, hi, ticks };
}

// ── Grouped Cash Flow Bar Chart (OCF / ICF / FinCF / FCF) ──────────────────

function CashFlowGroupedChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const ocf = aggregateCF(monthlyOCF, period);
  const icf = aggregateCF(monthlyICF, period);
  const fin = aggregateCF(monthlyFinancingCF, period);
  const fcf = aggregateCF(monthlyFreeCashFlow, period);
  const labels = cfPeriodLabels(period);

  const allVals = [...ocf, ...icf, ...fin, ...fcf];
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
  const barW = Math.min(8, groupW * 0.16);
  const zeroY = padT + cH / 2;

  const toY = (v: number) => zeroY - (v / maxAbs) * (cH / 2);

  const series = [
    { label: 'Operating CF', color: '#00FFCC', data: ocf },
    { label: 'Free Cash Flow', color: '#FFD700', data: fcf },
    { label: 'Investing CF', color: '#FF9F0A', data: icf },
    { label: 'Financing CF', color: '#64D2FF', data: fin },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        marginBottom: 4,
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        Cash Flow Components
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 4, flexShrink: 0, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
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
                // 4 bars centered in group: offsets -1.5, -0.5, +0.5, +1.5
                const xOff = (si - 1.5) * (barW + 1.5);
                const barCx = groupCx + xOff;
                return (
                  <rect
                    key={si}
                    x={barCx - barW / 2}
                    y={barY}
                    width={barW}
                    height={barH}
                    rx={1.2}
                    fill={s.color}
                    opacity={0.85}
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
    </div>
  );
}

// ── Total Liquidity Trend Line ─────────────────────────────────────────────

function LiquidityTrendChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();

  // Liquidity = Cash (CA) + Marketable Investments, derived from the single
  // source of truth (financialData.ts), no longer via mockData.
  const liquidityLakhs = monthlyCA.map((ca, i) => +(ca + monthlyInvestments[i]).toFixed(2));
  const data = aggregate(liquidityLakhs, period, true);
  const labels = periodLabels(period);

  // Symmetric, nice-numbered Y axis — asymmetric min*0.9/max*1.05 padding was
  // visually exaggerating small swings.
  const axis = niceAxis(Math.min(...data), Math.max(...data), 5);
  const range = axis.hi - axis.lo || 1;

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
    y: padT + cH - ((v - axis.lo) / range) * cH,
  }));

  const linePath = catmullRomPath(points);
  const areaPath = `${linePath} L${points[points.length - 1].x},${padT + cH} L${points[0].x},${padT + cH} Z`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        marginBottom: 4,
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        Total Liquidity Trend — Cash + Investments
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
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

        {axis.ticks.map((tv) => {
          const yy = padT + cH - ((tv - axis.lo) / range) * cH;
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
          <g key={i}>
            <motion.circle cx={p.x} cy={p.y} r={3} fill="#BF5AF2"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.2 }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(191,90,242,0.5))' }} />
            <text
              x={p.x}
              y={p.y - 6}
              textAnchor="middle"
              fill="#BF5AF2"
              fontSize={6}
              fontFamily="'JetBrains Mono', monospace"
              opacity={0.8}
            >
              {mask(formatCr(data[i]))}
            </text>
          </g>
        ))}

        {labels.map((m, i) => (
          <text key={m} x={padL + (i / Math.max(1, labels.length - 1)) * cW} y={h - 4} textAnchor="middle"
            fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">{m}</text>
        ))}
      </svg>
      </div>
    </div>
  );
}

// ── Main Cash Page ─────────────────────────────────────────────────────────

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

  // ── Cash position (Mar-26) ────────────────────────────────────────────────
  // Under the CA-as-Cash classification, Tally's Current Assets group is the
  // cash pot (HDFC/ICICI/Razorpay/PhonePe/short-term deposits — no trade AR in
  // SpeakX's B2C model).
  const cashMar = monthlyCA[11];
  const investmentsMar = monthlyInvestments[11];
  const liquidityMar = +(cashMar + investmentsMar).toFixed(2);

  // ── Revenue-based margin metrics ──────────────────────────────────────────
  const revenueYtd = sumArr(monthlyRevenue);
  const ocfMarginYtd = revenueYtd === 0 ? 0 : +((totalOCF / revenueYtd) * 100).toFixed(1);
  const fcfMarginYtd = revenueYtd === 0 ? 0 : +((totalFCF / revenueYtd) * 100).toFixed(1);

  // ── Runway: months of OpEx covered by total liquidity ─────────────────────
  // For a cash-positive SaaS company "burn multiple" doesn't apply — runway
  // is framed as "months the liquidity pool could cover OpEx if revenue went
  // to zero tomorrow" (conservative stress test).
  const avgMonthlyOpex = +(sumArr(monthlyTotalOpex) / 12).toFixed(2);
  const monthsOpexCovered = avgMonthlyOpex === 0 ? 0 : +(liquidityMar / avgMonthlyOpex).toFixed(1);

  const kpis = [
    {
      label: 'Total Liquidity',
      value: formatCr(liquidityMar),
      sub: `Cash ${formatCr(cashMar)} + Investments ${formatCr(investmentsMar)}`,
      positive: true,
    },
    {
      label: 'Operating CF (YTD)',
      value: formatCr(totalOCF),
      sub: `${ocfMarginYtd.toFixed(1)}% of revenue`,
      positive: totalOCF > 0,
      negative: totalOCF < 0,
    },
    {
      label: 'Free Cash Flow (YTD)',
      value: formatCr(totalFCF),
      sub: `${fcfMarginYtd.toFixed(1)}% margin · after CapEx ${formatCr(Math.abs(totalCapEx))}`,
      positive: totalFCF > 0,
      negative: totalFCF < 0,
    },
    {
      label: 'Runway',
      value: `${monthsOpexCovered.toFixed(0)} mo`,
      sub: `@ ${formatCr(avgMonthlyOpex)}/mo OpEx`,
      positive: monthsOpexCovered >= 18,
    },
    {
      label: 'Cash & Wallets',
      value: formatCr(cashMar),
      sub: 'HDFC · ICICI · Razorpay · PhonePe',
    },
    {
      label: 'Treasury Deployed',
      value: formatCr(totalTreasury),
      sub: 'Into MFs · Bonds · FDs (YTD)',
      negative: totalTreasury < 0,
    },
  ];

  const cfLabels = cfPeriodLabels(period);
  const tableHeaders = ['Component', ...cfLabels, 'YTD'];

  // ── Indirect-method CF table: now with CapEx / Treasury split ─────────────
  const cfRows: DataRow[] = [
    { label: '— Operating Activities —', values: [], ytd: 0, section: true },
    { label: 'Operating Cash Flow', values: aggregateCF(monthlyOCF, period), ytd: totalOCF, bold: true },
    { label: '— Investing Activities —', values: [], ytd: 0, section: true },
    { label: 'CapEx (Fixed Assets)', values: aggregateCF(monthlyCapEx, period), ytd: totalCapEx, indent: true },
    { label: 'Treasury (MF / Bonds / FD)', values: aggregateCF(monthlyTreasuryCF, period), ytd: totalTreasury, indent: true },
    { label: 'Investing Cash Flow', values: aggregateCF(monthlyICF, period), ytd: totalICF, bold: true },
    { label: '— Financing Activities —', values: [], ytd: 0, section: true },
    { label: 'Financing Cash Flow', values: aggregateCF(monthlyFinancingCF, period), ytd: totalFinCF, bold: true },
    { label: '— Results —', values: [], ytd: 0, section: true },
    { label: 'Free Cash Flow (OCF − CapEx)', values: aggregateCF(monthlyFreeCashFlow, period), ytd: totalFCF, bold: true, highlight: true },
    { label: 'Net Change in Cash', values: aggregateCF(monthlyNetCF, period), ytd: totalNetCF, bold: true, highlight: true },
  ];

  // ── Cash P&L (Direct Method) ─────────────────────────────────────────────
  // Reads like a P&L, numbers are cash flows. Data sourced directly from
  // Tally period-activity arrays for Sales Accounts / Direct Expenses /
  // Indirect Expenses / Indirect Incomes — which are ~95% cash-basis for
  // SpeakX's B2C model (payment gateways settle directly to bank, bills pay
  // in-month). The small accrual noise (month-end salary bookings, card
  // settlement timing) is the drift between this view's "Net Operating Cash
  // Flow" and the indirect-method "Operating Cash Flow" above — quantified in
  // the reconciliation row at the bottom of this table.

  const pnlLabels = periodLabels(period);
  const cashPnlHeaders = ['Cash Flow', ...pnlLabels, 'YTD'];

  // Aggregate each stream once so the math lines up across all rows.
  const revAgg = aggregate(monthlyRevenue, period);
  const oiAgg = aggregate(monthlyOtherIncome, period);
  const cogsAgg = aggregate(monthlyCOGS, period);
  const opexAgg = aggregate(monthlyTotalOpex, period);
  const taxAgg = aggregate(monthlyTax, period);

  const revYtd = sumArr(monthlyRevenue);
  const oiYtd = sumArr(monthlyOtherIncome);
  const cogsYtd = sumArr(monthlyCOGS);
  const opexYtd = sumArr(monthlyTotalOpex);
  const taxYtd = sumArr(monthlyTax);

  const inflowsByPeriod = revAgg.map((r, i) => +(r + oiAgg[i]).toFixed(2));
  const outflowsByPeriod = cogsAgg.map(
    (c, i) => +(c + opexAgg[i] + taxAgg[i]).toFixed(2),
  );
  const netCashByPeriod = inflowsByPeriod.map(
    (inn, i) => +(inn - outflowsByPeriod[i]).toFixed(2),
  );

  const inflowsYtd = +(revYtd + oiYtd).toFixed(2);
  const outflowsYtd = +(cogsYtd + opexYtd + taxYtd).toFixed(2);
  const netCashYtd = +(inflowsYtd - outflowsYtd).toFixed(2);

  // ── Reconciliation: direct vs indirect OCF ───────────────────────────────
  // Indirect OCF covers May-Mar (11 months — it needs a prior-month BS
  // baseline, so April can't have an indirect value). Direct Cash P&L covers
  // Apr-Mar (12 months). To make the two series comparable across monthly,
  // quarterly, and yearly views, we pad indirect with a zero for April and
  // then run both through the same `aggregate()` helper.
  //
  // The drift each period ≈ change in working capital (ΔCL) that the indirect
  // method picks up but the direct method doesn't — a feature, not a bug:
  // ΣDrift ≈ −Σ ΔCL (accrued vendor payables growing = cash "saved" in the
  // indirect view). CFOs reading the table should interpret a negative drift
  // as "payables grew this period, so indirect-OCF > direct-cash-earnings."
  const monthlyOCFPadded = [0, ...monthlyOCF];
  const indirectAgg = aggregate(monthlyOCFPadded, period);
  const driftValues = netCashByPeriod.map(
    (v, i) => +(v - indirectAgg[i]).toFixed(2),
  );
  const ocfDriftYtd = +(netCashYtd - totalOCF).toFixed(2);

  const cashPnlRows: DataRow[] = [
    // Cash Inflows
    { label: 'Revenue Received', values: revAgg, ytd: revYtd },
    { label: 'Other Income Received', values: oiAgg, ytd: oiYtd },
    { label: 'Total Cash Inflows', values: inflowsByPeriod, ytd: inflowsYtd, bold: true, highlight: true },
    // Cash Outflows
    { label: 'Cost of Revenue (Direct Expenses)', values: cogsAgg, ytd: cogsYtd },
    { label: 'Operating Expenses (incl. interest)', values: opexAgg, ytd: opexYtd },
    { label: 'Income Tax Paid', values: taxAgg, ytd: taxYtd },
    { label: 'Total Cash Outflows', values: outflowsByPeriod, ytd: outflowsYtd, bold: true, highlight: true },
    // Net
    { label: 'Net Operating Cash Flow (direct)', values: netCashByPeriod, ytd: netCashYtd, bold: true, highlight: true },
    // Reconciliation row — drift between direct (Cash P&L above) and indirect
    // (Cash Flow Statement up top) OCF. Non-zero drift is accrual noise:
    // month-end salary accruals, wallet settlement timing, and small GST/TDS
    // cut-offs. Close-to-zero drift means the direct method ties out.
    { label: 'Drift vs Indirect-Method OCF', values: driftValues, ytd: ocfDriftYtd },
  ];

  return (
    <PageShell>
      <SectionHeader title="CASH FLOW & LIQUIDITY" />
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
          <CashFlowGroupedChart />
        </GlassCard>
        <GlassCard delay={0.1}>
          <LiquidityTrendChart />
        </GlassCard>
      </div>

      <div style={{ flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 9,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 4,
          marginTop: 2,
        }}>
          Indirect Method — derived from Balance Sheet deltas
        </div>
        <DataTable
          headers={tableHeaders}
          rows={cfRows}
          formatValue={(v) => formatCr(v)}
        />

        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 9,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginTop: 10,
          marginBottom: 4,
        }}>
          Cash P&L — Direct Method (Revenue − Expenses − Tax)
        </div>
        <DataTable
          headers={cashPnlHeaders}
          rows={cashPnlRows}
          formatValue={(v) => formatCr(v)}
        />
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 8,
          color: 'rgba(255,255,255,0.4)',
          marginTop: 6,
          lineHeight: 1.5,
          maxWidth: 760,
          padding: '8px 10px',
          background: 'rgba(255, 159, 10, 0.04)',
          border: '1px solid rgba(255, 159, 10, 0.15)',
          borderRadius: 6,
        }}>
          <strong style={{ color: 'rgba(255, 159, 10, 0.9)' }}>Classification notes (Ind-AS 7):</strong>
          {' '}
          <strong>Cash &amp; Equivalents</strong> = Tally's Current Assets group. For SpeakX's B2C model
          this is effectively Bank + payment gateway (Razorpay/PhonePe) + short-term deposits — there are
          no trade receivables and GST input / prepayments are immaterial. Fixed Assets ({formatCr(monthlyFixedAssets[11])})
          are excluded from liquidity.
          {' '}
          <strong>Finance Costs</strong> (interest on loans, bank charges) are classified under Operating
          Activities per Ind-AS 7 para 33 option (a) and flow through the "Operating Expenses (incl. interest)"
          line of the direct-method Cash P&L.
          {' '}
          <strong>Income Taxes Paid</strong> shows ₹0 because no tax has been booked in FY26 yet — year-end
          provision will populate this line at close. See P&L page for the estimated statutory provision at 25.17%.
          {' '}
          <strong>GST cash flow</strong> is not broken out separately because Tally group-level TB rolls GST
          payable into Current Liabilities.
        </div>
      </div>
    </PageShell>
  );
}
