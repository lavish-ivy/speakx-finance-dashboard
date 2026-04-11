import { FONTS } from '../../theme/typography';
import { financialKPIs, estTaxProvision, cashFlowData } from '../../data/mockData';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useMaskedValue } from '../../context/DashboardContext';

/**
 * Editorial hero — the CFO take-home in one paragraph.
 *
 * Replaces the old 6-row "Key figures" strip (FinancialKPIs.tsx) as the top of
 * the Overview. Structure is deliberately magazine-style:
 *
 *   1. Serif italic standfirst  — one sentence, the 30-second take-home
 *   2. Four display figures     — Revenue · PBT · FCF · Liquidity
 *   3. Reconciliation footnote  — PBT→PAT bridge + methodology caveats
 *
 * Why 4 figures and not 5: Estimated PAT lives inside the standfirst and the
 * reconciliation strip, so it doesn't need its own display slot. Keeping the
 * tile row to 4 lets each number breathe at 34-40px Fraunces instead of the
 * cramped 26px the old 6-row strip was stuck with.
 *
 * Why "expense coverage" and not "runway": SpeakX is profitable (PBT > 0).
 * Runway only reads right when burn is positive — for a profitable company
 * the CFO frame is "how many months of OpEx could the treasury cover if
 * revenue went to zero", which is just liquidity / (totalExp / 12).
 */

/** Months of expense coverage at the current run-rate. */
function coverageMonths(liquidity: number, annualExpense: number): number {
  if (annualExpense <= 0) return 0;
  return +(liquidity / (annualExpense / 12)).toFixed(1);
}

interface Figure {
  label: string;
  value: number;
  accent?: boolean;
}

export default function HeroStatement() {
  const { isMobile, isTablet } = useBreakpoint();
  const mask = useMaskedValue();

  const revenue = financialKPIs.revenue.value;
  const pbt = financialKPIs.pbt.value;
  const estPat = financialKPIs.estPat.value;
  const totalExp = financialKPIs.totalExpenses.value;
  const fcf = cashFlowData.ytd.fcf.value;
  const liquidity = cashFlowData.ytd.liquidity.value;
  const taxProvision = estTaxProvision.amountCr;
  const taxRatePct = (estTaxProvision.rate * 100).toFixed(2);
  const coverage = coverageMonths(liquidity, totalExp);

  const figures: Figure[] = [
    { label: 'Revenue',           value: revenue },
    { label: 'PBT (Booked)',      value: pbt },
    { label: 'Free cash flow',    value: fcf },
    { label: 'Closing liquidity', value: liquidity, accent: true },
  ];

  const figureFontSize = isMobile ? 26 : isTablet ? 30 : 38;
  const standfirstSize = isMobile ? 16 : isTablet ? 19 : 22;

  return (
    <section
      className="fade-in-up"
      style={{
        animationDelay: '0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 14 : 18,
      }}
    >
      {/* Standfirst — the 30-second take-home */}
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
        Across FY 2025-26, SpeakX generated{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`₹${revenue.toFixed(2)} Cr`)}
        </strong>{' '}
        in revenue and booked{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>
          {mask(`₹${pbt.toFixed(2)} Cr`)}
        </strong>{' '}
        in pre-tax profit — {mask(`₹${estPat.toFixed(2)} Cr`)} after an estimated{' '}
        {taxRatePct}% provision under §115BAA. The business threw off{' '}
        {mask(`₹${fcf.toFixed(2)} Cr`)} of free cash across the 11-month cash
        window and closed March with{' '}
        <strong style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--accent-coral)' }}>
          {mask(`₹${liquidity.toFixed(2)} Cr`)}
        </strong>{' '}
        in liquidity — roughly {coverage.toFixed(1)} months of expense coverage
        at the current run-rate.
      </p>

      {/* Four display figures — the numbers that matter */}
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
              <span>{mask(`₹${f.value.toFixed(2)}`)}</span>
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
            </div>
          </div>
        ))}
      </div>

      {/* Reconciliation bridge — the footnote a CFO keeps pointing to */}
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
          PBT → PAT bridge: {mask(`₹${pbt.toFixed(2)}`)} − {mask(`₹${taxProvision.toFixed(2)}`)} (tax @{taxRatePct}%) = {mask(`₹${estPat.toFixed(2)}`)}
        </span>
        <span aria-hidden>·</span>
        <span>Tax provision not yet booked in Tally; year-end adjustment</span>
        <span aria-hidden>·</span>
        <span>Mar-26 Other Income elevated — year-end treasury accrual</span>
      </div>
    </section>
  );
}
