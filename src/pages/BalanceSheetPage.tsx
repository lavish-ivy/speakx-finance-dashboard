import EditorialPageShell from '../hud/shared/EditorialPageShell';
import EditorialDataTable, { type EditorialDataRow } from '../hud/shared/EditorialDataTable';
import PanelFootnote from '../hud/shared/PanelFootnote';
import { FONTS, SIZES } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { useDashboard, useMaskedValue } from '../context/DashboardContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  monthlyNCA,
  monthlyCA,
  monthlyEquity,
  monthlyNCL,
  monthlyCL,
  monthlyTotalAssets,
  monthlyFixedAssets,
  monthlyInvestments,
  monthlyCapital,
  monthlyPnLAccount,
  monthlyPBT,
  aggregate,
  periodLabels,
  formatCr,
} from '../data/financialData';
import { niceAxis } from '../utils/chartMath';

/**
 * BalanceSheetPage — editorial rewrite.
 *
 * Replaces the gamer-HUD chrome (Orbitron chart titles, JetBrains Mono axis
 * labels, `#00FFCC`/`#BF5AF2`/`#39FF14`/`#64D2FF`/`#FF9F0A` hex literals,
 * GlassCard backdrop blur, and the cyan rgba "classification notes" warning
 * box) with the editorial IA used by `HUD.tsx` and `HeroStatement.tsx`.
 *
 *   EditorialPageShell
 *     └─ Header + eyebrow + serif title + rule--thick
 *     └─ BalanceSheetHero — standfirst + 4 display figures (Assets / Net Worth / Treasury / Current Ratio)
 *     └─ rule--thick
 *     └─ AssetChart (full-width hero — stacked PP&E / Treasury / Cash)
 *     └─ rule
 *     └─ LiabilitiesChart (supporting — stacked Equity / NCL / CL)
 *     └─ rule
 *     └─ EditorialDataTable (sectioned BS rows, equity rolled)
 *     └─ PanelFootnote (Ind-AS 1 / Schedule III methodology)
 */

const LAKHS_PER_CRORE = 100;

// ── Editorial panel frame ───────────────────────────────────────────────────

const panelFrame: React.CSSProperties = {
  padding: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

// ── Hero standfirst ─────────────────────────────────────────────────────────

interface HeroFigure {
  label: string;
  value: string;
  accent?: boolean;
}

function BalanceSheetHero() {
  const { isMobile, isTablet } = useBreakpoint();
  const mask = useMaskedValue();

  const latestTA = monthlyTotalAssets[11] / LAKHS_PER_CRORE;
  const latestInv = monthlyInvestments[11] / LAKHS_PER_CRORE;
  const latestCA = monthlyCA[11] / LAKHS_PER_CRORE;
  const latestCL = monthlyCL[11] / LAKHS_PER_CRORE;
  const latestNCL = monthlyNCL[11] / LAKHS_PER_CRORE;
  const latestEq = monthlyEquity[11] / LAKHS_PER_CRORE;
  const latestPBT = monthlyPBT[11] / LAKHS_PER_CRORE;

  const latestNetWorth = +(latestEq + latestPBT).toFixed(2);
  const workingCapital = +(latestCA - latestCL).toFixed(2);
  const currentRatio = latestCL === 0 ? 0 : +(latestCA / latestCL).toFixed(2);
  const debtToEquity = latestNetWorth === 0 ? 0 : latestNCL / latestNetWorth;
  const treasuryPctOfAssets = latestTA === 0 ? 0 : +((latestInv / latestTA) * 100).toFixed(1);

  const figures: HeroFigure[] = [
    { label: 'Total assets',      value: `₹${latestTA.toFixed(2)}` },
    { label: 'Net worth',         value: `₹${latestNetWorth.toFixed(2)}`, accent: true },
    { label: 'Treasury deployed', value: `₹${latestInv.toFixed(2)}` },
    { label: 'Current ratio',     value: `${currentRatio.toFixed(2)}x` },
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
        SpeakX closes FY 2025-26 with{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`₹${latestTA.toFixed(2)} Cr`)}
        </strong>{' '}
        of total assets, of which{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`${treasuryPctOfAssets.toFixed(1)}%`)}
        </strong>{' '}
        sits in the treasury pool (liquid mutual funds, corporate bonds, and
        short-term deposits). The book is funded almost entirely by equity —
        debt-to-equity stands at{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {debtToEquity.toFixed(4)}x
        </strong>
        {' '}— leaving a net worth of{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--accent-coral)' }}>
          {mask(`₹${latestNetWorth.toFixed(2)} Cr`)}
        </strong>
        . Working capital runs at {mask(`₹${workingCapital.toFixed(2)} Cr`)},
        negative by design: customer prepayments for subscription courses finance
        the business at zero cost.
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
          Debt/Equity {debtToEquity.toFixed(4)}x · Virtually debt-free
        </span>
        <span aria-hidden>·</span>
        <span>
          Working capital {mask(`₹${workingCapital.toFixed(2)} Cr`)} — agency float
        </span>
        <span aria-hidden>·</span>
        <span>Current-period PBT rolled into equity so A = E + L ties at every period</span>
      </div>
    </section>
  );
}

// ── Stacked Asset Chart (Fixed Assets / Treasury / Cash) — hero chart ───────

function AssetChart() {
  const { period } = useDashboard();
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();
  const mask = useMaskedValue();

  const fa = aggregate(monthlyFixedAssets, period, true);
  const inv = aggregate(monthlyInvestments, period, true);
  const cash = aggregate(monthlyCA, period, true);
  const labels = periodLabels(period);
  const totals = fa.map((f, i) => f + inv[i] + cash[i]);

  const axis = niceAxis(0, Math.max(...totals), 5);
  const range = axis.hi - axis.lo || 1;

  const w = 880;
  const h = isMobile ? 220 : 260;
  const padL = 58;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(32, (cW / labels.length) * 0.55);
  const toY = (v: number) => padT + cH - ((v - axis.lo) / range) * cH;

  const series = [
    { label: 'Fixed assets',       slot: '#BF5AF2', data: fa },
    { label: 'Treasury',           slot: '#00FFCC', data: inv },
    { label: 'Cash & equivalents', slot: '#FFD700', data: cash },
  ];

  const closing = totals[totals.length - 1];

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
            Asset composition
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
            Stacked · PP&E · Treasury · Cash · ₹ Crores
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: FONTS.sans.family }}>
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
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
                fontVariantNumeric: 'tabular-nums lining-nums',
              }}
            >
              {mask(formatCr(closing))}
            </span>
          </div>
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
          {axis.ticks.map((tv) => (
            <g key={tv}>
              <line
                x1={padL}
                y1={toY(tv)}
                x2={padL + cW}
                y2={toY(tv)}
                strokeDasharray="4 3"
                strokeWidth={1}
                style={{ stroke: 'var(--chart-gridline)' }}
              />
              <text
                x={padL - 6}
                y={toY(tv) + 3}
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
                  const color = mapColor(s.slot);
                  return (
                    <rect
                      key={si}
                      x={cx - barW / 2}
                      y={segY}
                      width={barW}
                      height={segH}
                      fill={color}
                      opacity={0.72}
                    />
                  );
                })}
              </g>
            );
          })}

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
          'Fixed Assets = Tally PP&E group (IT equipment + office infra)',
          'Treasury = liquid MFs, corporate bonds, short-term FDs',
          'Cash = bank + Razorpay/PhonePe settlements',
        ]}
      />
    </div>
  );
}

// ── Stacked Equity & Liabilities Chart — supporting chart ───────────────────

function LiabilitiesChart() {
  const { period } = useDashboard();
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();
  const mask = useMaskedValue();

  // Roll current-month PBT into equity so the chart ties to Total Assets
  // at every period (BS identity A = E_rolled + NCL + CL).
  const equityRolled = monthlyEquity.map((e, i) => +(e + monthlyPBT[i]).toFixed(2));
  const eq = aggregate(equityRolled, period, true);
  const ncl = aggregate(monthlyNCL, period, true);
  const cl = aggregate(monthlyCL, period, true);
  const labels = periodLabels(period);
  const totals = eq.map((e, i) => e + ncl[i] + cl[i]);

  const axis = niceAxis(0, Math.max(...totals), 5);
  const range = axis.hi - axis.lo || 1;

  const w = 880;
  const h = isMobile ? 220 : 260;
  const padL = 58;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const barW = Math.min(32, (cW / labels.length) * 0.55);
  const toY = (v: number) => padT + cH - ((v - axis.lo) / range) * cH;

  const series = [
    { label: 'Equity',          slot: '#64D2FF', data: eq },
    { label: 'NCL (loans)',     slot: '#BF5AF2', data: ncl },
    { label: 'Current liab.',   slot: '#FF9F0A', data: cl },
  ];

  const closing = totals[totals.length - 1];

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
            Equity and liabilities
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
            Stacked · Funded &gt;98% by equity · ₹ Crores
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: FONTS.sans.family }}>
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
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
                fontVariantNumeric: 'tabular-nums lining-nums',
              }}
            >
              {mask(formatCr(closing))}
            </span>
          </div>
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
          {axis.ticks.map((tv) => (
            <g key={tv}>
              <line
                x1={padL}
                y1={toY(tv)}
                x2={padL + cW}
                y2={toY(tv)}
                strokeDasharray="4 3"
                strokeWidth={1}
                style={{ stroke: 'var(--chart-gridline)' }}
              />
              <text
                x={padL - 6}
                y={toY(tv) + 3}
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
                  const color = mapColor(s.slot);
                  return (
                    <rect
                      key={si}
                      x={cx - barW / 2}
                      y={segY}
                      width={barW}
                      height={segH}
                      fill={color}
                      opacity={0.72}
                    />
                  );
                })}
              </g>
            );
          })}

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
          'Equity includes current-period PBT rolled from Sales/Expenses ledgers',
          'NCL = long-term loans only — term deposits excluded',
          'Current Liabilities step up in Nov-Mar = marketing vendor payables',
        ]}
      />
    </div>
  );
}

// ── Main Balance Sheet Page ─────────────────────────────────────────────────

export default function BalanceSheetPage() {
  const { period } = useDashboard();
  const { isMobile } = useBreakpoint();

  const latestTA = monthlyTotalAssets[11];
  const latestInv = monthlyInvestments[11];
  const latestCA = monthlyCA[11];
  const latestCL = monthlyCL[11];
  const latestPBT = monthlyPBT[11];

  const workingCapital = +(latestCA - latestCL).toFixed(2);
  const currentRatio = latestCL === 0 ? 0 : +(latestCA / latestCL).toFixed(2);
  const treasuryPctOfAssets = latestTA === 0 ? 0 : +((latestInv / latestTA) * 100).toFixed(1);

  const labels = periodLabels(period);
  const tableHeaders = ['Item', ...labels];

  // Roll current-period PBT into equity so A = E + L ties at every period
  const equityRolled = monthlyEquity.map((e, i) => +(e + monthlyPBT[i]).toFixed(2));
  const totalEL = equityRolled.map(
    (e, i) => +(e + monthlyNCL[i] + monthlyCL[i]).toFixed(2),
  );

  const bsRows: EditorialDataRow[] = [
    { label: '— Assets —', values: [], section: true },
    {
      label: 'Non-Current Assets',
      values: aggregate(monthlyNCA, period, true),
      bold: true,
      children: [
        { label: 'Fixed Assets (PP&E)', values: aggregate(monthlyFixedAssets, period, true), indent: true },
        { label: 'Investments (Treasury)', values: aggregate(monthlyInvestments, period, true), indent: true },
      ],
    },
    { label: 'Current Assets (Cash & Equiv.)', values: aggregate(monthlyCA, period, true), bold: true },
    { label: 'Total Assets', values: aggregate(monthlyTotalAssets, period, true), bold: true, highlight: true },

    { label: '— Equity & Liabilities —', values: [], section: true },
    {
      label: 'Total Equity (Net Worth)',
      values: aggregate(equityRolled, period, true),
      bold: true,
      children: [
        { label: 'Capital Account', values: aggregate(monthlyCapital, period, true), indent: true },
        { label: 'P&L A/c (prior periods)', values: aggregate(monthlyPnLAccount, period, true), indent: true },
        { label: 'Current Period PBT (not yet closed)', values: aggregate(monthlyPBT, period, true), indent: true },
      ],
    },
    { label: 'Non-Current Liabilities (Loans)', values: aggregate(monthlyNCL, period, true), bold: true },
    { label: 'Current Liabilities', values: aggregate(monthlyCL, period, true), bold: true },
    { label: 'Total Equity & Liabilities', values: aggregate(totalEL, period, true), bold: true, highlight: true },
  ];

  return (
    <EditorialPageShell
      title="Balance sheet"
      eyebrow="Route · Balance sheet · Mar-26 snapshot · Tally group-level TB"
    >
      <BalanceSheetHero />

      <hr className="rule rule--thick" style={{ margin: 0 }} />

      <AssetChart />

      <hr className="rule" style={{ margin: 0 }} />

      <LiabilitiesChart />

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
            Ind-AS 1 / Schedule III · Equity rolled to tie the BS identity
          </div>
        </div>

        <EditorialDataTable
          headers={tableHeaders}
          rows={bsRows}
          formatValue={(v) => formatCr(v)}
          defaultOpen
          toggleLabel="View balance sheet"
        />

        <PanelFootnote
          notes={[
            `Investments (${treasuryPctOfAssets.toFixed(1)}% of assets) is treasury-deployed surplus — MFs, bonds, FDs — not strategic stakes`,
            `Current Assets = Cash & Equivalents: bank + Razorpay/PhonePe + short-term deposits. No trade receivables (B2C model)`,
            `Current Period PBT ${formatCr(latestPBT)} rolled into equity — Tally holds it in Sales/Expenses until year-end close`,
            `Working Capital ${formatCr(workingCapital)} negative by design — customer prepayments finance the business`,
            `Current Ratio ${currentRatio.toFixed(2)}x low but appropriate — treasury pool (${formatCr(latestInv)}) is the real liquidity cushion`,
          ]}
        />
      </div>
    </EditorialPageShell>
  );
}
