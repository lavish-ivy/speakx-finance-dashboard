import PageShell from './PageShell';
import SectionHeader from '../sections/SectionHeader';
import GlassCard from '../shared/GlassCard';
import KPIBar from '../shared/KPIBar';
import DataTable, { type DataRow } from '../shared/DataTable';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyNCA, monthlyCA, monthlyEquity, monthlyNCL, monthlyCL,
  monthlyTotalAssets, monthlyFixedAssets, monthlyInvestments,
  monthlyCapital, monthlyPnLAccount, monthlyPBT,
  aggregate, periodLabels, formatCr,
} from '../data/financialData';
import { niceAxis } from '../utils/chartMath';

// ── Stacked Asset Chart (Fixed Assets / Treasury / Cash) ───────────────────
//
// Previously stacked NCA on top of CA, which hid the real story: 98% of assets
// are marketable investments (treasury), ~2% is cash, ~2% is PP&E. A three-band
// stack with niceAxis makes the composition legible in a single glance.

function AssetChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();
  const fa = aggregate(monthlyFixedAssets, period, true);
  const inv = aggregate(monthlyInvestments, period, true);
  const cash = aggregate(monthlyCA, period, true);
  const labels = periodLabels(period);
  const totals = fa.map((f, i) => f + inv[i] + cash[i]);

  const axis = niceAxis(0, Math.max(...totals), 5);
  const range = axis.hi - axis.lo || 1;

  const w = 440;
  const h = 200;
  const padL = 50;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(28, (cW / labels.length) * 0.6);
  const toY = (v: number) => padT + cH - ((v - axis.lo) / range) * cH;

  const series = [
    { label: 'Fixed Assets', color: '#BF5AF2', data: fa },
    { label: 'Treasury', color: '#00FFCC', data: inv },
    { label: 'Cash & Equivalents', color: '#39FF14', data: cash },
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
        Asset Composition — PP&E · Treasury · Cash
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 4, flexShrink: 0, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          {axis.ticks.map((tv) => (
            <g key={tv}>
              <line x1={padL} y1={toY(tv)} x2={padL + cW} y2={toY(tv)} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padL - 4} y={toY(tv) + 3} textAnchor="end" fill="var(--text-muted)" fontSize={6} fontFamily="'JetBrains Mono', monospace">
                {mask(formatCr(tv))}
              </text>
            </g>
          ))}

          {labels.map((_, i) => {
            const cx = padL + ((i + 0.5) / labels.length) * cW;
            // Stack bottom-up: fa, then inv, then cash
            let cumBase = 0;
            return (
              <g key={i}>
                {series.map((s, si) => {
                  const v = s.data[i];
                  const segH = (v / range) * cH;
                  const segY = toY(cumBase + v);
                  cumBase += v;
                  const isTop = si === series.length - 1;
                  return (
                    <rect
                      key={si}
                      x={cx - barW / 2}
                      y={segY}
                      width={barW}
                      height={segH}
                      fill={s.color}
                      rx={isTop ? 2 : 0}
                      opacity={0.75}
                    />
                  );
                })}
                <text
                  x={cx}
                  y={toY(totals[i]) - 3}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.75)"
                  fontSize={6}
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {mask(formatCr(totals[i]))}
                </text>
              </g>
            );
          })}

          {labels.map((m, i) => (
            <text key={m} x={padL + ((i + 0.5) / labels.length) * cW} y={h - 4} textAnchor="middle"
              fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">{m}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Equity & Liabilities Stacked Chart (Equity / NCL / CL) ─────────────────

function LiabilitiesChart() {
  const { period } = useDashboard();
  const mask = useMaskedValue();

  // Roll the current-month PBT into Equity so the chart ties to Total Assets
  // at every period — see the note at the top of the page.
  const equityRolled = monthlyEquity.map((e, i) => +(e + monthlyPBT[i]).toFixed(2));
  const eq = aggregate(equityRolled, period, true);
  const ncl = aggregate(monthlyNCL, period, true);
  const cl = aggregate(monthlyCL, period, true);
  const labels = periodLabels(period);
  const totals = eq.map((e, i) => e + ncl[i] + cl[i]);

  const axis = niceAxis(0, Math.max(...totals), 5);
  const range = axis.hi - axis.lo || 1;

  const w = 440;
  const h = 200;
  const padL = 50;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(28, (cW / labels.length) * 0.6);
  const toY = (v: number) => padT + cH - ((v - axis.lo) / range) * cH;

  const series = [
    { label: 'Equity', color: '#64D2FF', data: eq },
    { label: 'NCL (Loans)', color: '#BF5AF2', data: ncl },
    { label: 'Current Liab.', color: '#FF9F0A', data: cl },
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
        Equity &amp; Liabilities — Funded &gt;98% by Equity
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 4, flexShrink: 0, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          {axis.ticks.map((tv) => (
            <g key={tv}>
              <line x1={padL} y1={toY(tv)} x2={padL + cW} y2={toY(tv)} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padL - 4} y={toY(tv) + 3} textAnchor="end" fill="var(--text-muted)" fontSize={6} fontFamily="'JetBrains Mono', monospace">
                {mask(formatCr(tv))}
              </text>
            </g>
          ))}

          {labels.map((_, i) => {
            const cx = padL + ((i + 0.5) / labels.length) * cW;
            let cumBase = 0;
            return (
              <g key={i}>
                {series.map((s, si) => {
                  const v = s.data[i];
                  const segH = (v / range) * cH;
                  const segY = toY(cumBase + v);
                  cumBase += v;
                  const isTop = si === series.length - 1;
                  return (
                    <rect
                      key={si}
                      x={cx - barW / 2}
                      y={segY}
                      width={barW}
                      height={segH}
                      fill={s.color}
                      rx={isTop ? 2 : 0}
                      opacity={0.75}
                    />
                  );
                })}
                <text
                  x={cx}
                  y={toY(totals[i]) - 3}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.75)"
                  fontSize={6}
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {mask(formatCr(totals[i]))}
                </text>
              </g>
            );
          })}

          {labels.map((m, i) => (
            <text key={m} x={padL + ((i + 0.5) / labels.length) * cW} y={h - 4} textAnchor="middle"
              fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">{m}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Main Balance Sheet Page ────────────────────────────────────────────────

export default function BalanceSheetPage() {
  const { period } = useDashboard();
  const { isMobile } = useBreakpoint();

  // ── Latest month (Mar-26) snapshot ────────────────────────────────────────
  const latestTA = monthlyTotalAssets[11];
  const latestFA = monthlyFixedAssets[11];
  const latestInv = monthlyInvestments[11];
  const latestCA = monthlyCA[11];
  const latestEq = monthlyEquity[11];
  const latestCL = monthlyCL[11];
  const latestNCL = monthlyNCL[11];
  const latestPBT = monthlyPBT[11];

  // ── Rolled equity ties the BS identity ────────────────────────────────────
  // Tally carries current-period P&L inside the Sales/Expenses ledgers until
  // the year-end close transfers it to the P&L A/c group. So at any month M:
  //     Tally's displayed Equity[M] = Capital[M] + cum(PBT[Apr..M-1])
  // which is missing the current month's PBT. Adding PBT[M] back gives the
  // "economic" equity the investor expects to see — and makes Total E&L
  // reconcile to Total Assets exactly (verified by `bs-equation` validator).
  const latestNetWorth = +(latestEq + latestPBT).toFixed(2);

  // ── Working capital & ratios ──────────────────────────────────────────────
  // WC < 0 is the signature of a cash-positive B2C operation: customers pay
  // before service delivery (agency float) and vendor bills settle with a
  // lag. Negative WC here is a feature, not a red flag — the company is being
  // financed for free by its own customers.
  const workingCapital = +(latestCA - latestCL).toFixed(2);
  const currentRatio = latestCL === 0 ? 0 : +(latestCA / latestCL).toFixed(2);
  const debtToEquity = latestNetWorth === 0 ? 0 : latestNCL / latestNetWorth;
  const treasuryPctOfAssets = latestTA === 0 ? 0 : +((latestInv / latestTA) * 100).toFixed(1);

  const kpis = [
    {
      label: 'Total Assets',
      value: formatCr(latestTA),
      sub: `NCA ${formatCr(latestFA + latestInv)} + Cash ${formatCr(latestCA)}`,
      positive: true,
    },
    {
      label: 'Net Worth',
      value: formatCr(latestNetWorth),
      sub: `Capital + Reserves (Mar-26)`,
      positive: true,
    },
    {
      label: 'Treasury Deployed',
      value: formatCr(latestInv),
      sub: `${treasuryPctOfAssets.toFixed(1)}% of assets · MF/Bonds/FD`,
    },
    {
      label: 'Working Capital',
      value: formatCr(workingCapital),
      sub: workingCapital < 0 ? 'Agency float (customer prepaid)' : 'CA − CL',
      positive: workingCapital >= 0,
      negative: workingCapital < 0,
    },
    {
      label: 'Current Ratio',
      value: `${currentRatio.toFixed(2)}x`,
      sub: `CA ${formatCr(latestCA)} / CL ${formatCr(latestCL)}`,
      // Negative WC is normal for this business — don't flag as a stress
      // indicator unless the ratio collapses below 0.15.
      negative: currentRatio < 0.15,
    },
    {
      label: 'Debt / Equity',
      value: `${debtToEquity.toFixed(4)}x`,
      sub: debtToEquity < 0.05 ? 'Virtually debt-free' : 'Leveraged',
      positive: debtToEquity < 0.05,
    },
  ];

  const labels = periodLabels(period);
  const tableHeaders = ['Item', ...labels];

  // ── BS Table: sectioned, reconciled, and tied to the BS equation ─────────
  //
  // Key change from the prior version: Equity is now presented as
  //   Capital Account
  //     + P&L A/c (prior periods)
  //     + Current Period PBT (not yet closed)
  //   = Total Equity (rolled)
  // so that  A = E_rolled + NCL + CL  holds at every period, matching the
  // validator and what the investor expects to see. The "Current Period PBT"
  // row is annotated in the classification footnote below.

  const equityRolled = monthlyEquity.map((e, i) => +(e + monthlyPBT[i]).toFixed(2));
  const totalEL = equityRolled.map(
    (e, i) => +(e + monthlyNCL[i] + monthlyCL[i]).toFixed(2),
  );

  const bsRows: DataRow[] = [
    { label: '— Assets —', values: [], section: true },
    { label: 'Non-Current Assets', values: aggregate(monthlyNCA, period, true), bold: true },
    { label: 'Fixed Assets (PP&E)', values: aggregate(monthlyFixedAssets, period, true), indent: true },
    { label: 'Investments (Treasury)', values: aggregate(monthlyInvestments, period, true), indent: true },
    { label: 'Current Assets (Cash & Equiv.)', values: aggregate(monthlyCA, period, true), bold: true },
    { label: 'Total Assets', values: aggregate(monthlyTotalAssets, period, true), bold: true, highlight: true },

    { label: '— Equity & Liabilities —', values: [], section: true },
    { label: 'Total Equity (Net Worth)', values: aggregate(equityRolled, period, true), bold: true },
    { label: 'Capital Account', values: aggregate(monthlyCapital, period, true), indent: true },
    { label: 'P&L A/c (prior periods)', values: aggregate(monthlyPnLAccount, period, true), indent: true },
    { label: 'Current Period PBT (not yet closed)', values: aggregate(monthlyPBT, period, true), indent: true },
    { label: 'Non-Current Liabilities (Loans)', values: aggregate(monthlyNCL, period, true), bold: true },
    { label: 'Current Liabilities', values: aggregate(monthlyCL, period, true), bold: true },
    { label: 'Total Equity & Liabilities', values: aggregate(totalEL, period, true), bold: true, highlight: true },
  ];

  return (
    <PageShell>
      <SectionHeader title="BALANCE SHEET" />
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
          <AssetChart />
        </GlassCard>
        <GlassCard delay={0.1}>
          <LiabilitiesChart />
        </GlassCard>
      </div>

      <div style={{ flexShrink: 0 }}>
        <DataTable
          headers={tableHeaders}
          rows={bsRows}
          formatValue={(v) => formatCr(v)}
        />

        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 8,
          color: 'rgba(255,255,255,0.4)',
          marginTop: 8,
          lineHeight: 1.5,
          maxWidth: 880,
          padding: '8px 10px',
          background: 'rgba(100, 210, 255, 0.04)',
          border: '1px solid rgba(100, 210, 255, 0.15)',
          borderRadius: 6,
        }}>
          <strong style={{ color: 'rgba(100, 210, 255, 0.9)' }}>Classification notes (Ind-AS 1 / Schedule III):</strong>
          {' '}
          <strong>Investments</strong> ({formatCr(latestInv)}, {treasuryPctOfAssets.toFixed(1)}% of assets) is
          treasury-deployed surplus — liquid mutual funds, corporate bonds, and short-term FDs — not
          strategic subsidiaries or long-term equity stakes. These are effectively cash-like but carried
          in NCA per Tally's group treatment.
          {' '}
          <strong>Current Assets</strong> ({formatCr(latestCA)}) is Cash &amp; Equivalents under the CA-as-Cash
          classification used on the Cash page: HDFC/ICICI bank balances, Razorpay/PhonePe gateway
          settlements, and short-term deposits. SpeakX is B2C so there are no trade receivables; GST
          input and prepayments are immaterial at this scale.
          {' '}
          <strong>Current Period PBT</strong> ({formatCr(latestPBT)} in Mar-26) sits inside Tally's
          Sales/Expenses ledgers until the year-end close transfers it to the P&amp;L A/c group. We roll
          it into Total Equity here so the BS identity (A = E + L) ties at every period — this is the
          same treatment the on-load validator uses to sanity-check the numbers.
          {' '}
          <strong>Working Capital</strong> ({formatCr(workingCapital)}) is negative by design: customer
          prepayments for subscription courses and vendor payable float finance the business at zero cost.
          Current Ratio of {currentRatio.toFixed(2)}x is low by textbook standards but appropriate for a
          cash-positive B2C model — the {formatCr(latestInv)} treasury pool provides the real liquidity
          cushion, not current assets.
        </div>
      </div>
    </PageShell>
  );
}
