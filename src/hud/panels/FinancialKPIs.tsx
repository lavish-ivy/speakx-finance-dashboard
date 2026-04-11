import React from 'react';
import { financialKPIs, estTaxProvision } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { FONTS, SIZES } from '../../theme/typography';
type KPIKey = keyof typeof financialKPIs;
import Sparkline from '../shared/Sparkline';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface KpiRow {
  label: string;
  value: string;
  color: string;
  sparkline: number[] | null;
  tooltip?: string;
}

/**
 * Key-figures strip — editorial treatment.
 *
 * Ordering: Revenue → Other Income → Total Income → Total Expenses → PBT → Est. PAT
 *
 * Previously this strip showed a single "NET PROFIT" row sourced from monthlyPAT,
 * which equals PBT in the raw Tally data because the year-end tax provision is
 * not booked monthly. That was a silent mislabel. The final two rows now expose
 * the same "Booked PBT vs Estimated PAT @115BAA" framing the P&L page uses.
 *
 * Visual treatment: serif section title, small-caps row labels, tabular-figures
 * Inter for the numbers, no glass-card chrome and no drop-shadow glow.
 */
const kpiKeyOrder: KPIKey[] = ['revenue', 'otherIncome', 'totalIncome', 'totalExpenses', 'pbt', 'estPat'];

const estPatTooltip = `Estimated post-provision PAT at the statutory 115BAA rate (${(
  estTaxProvision.rate * 100
).toFixed(2)}%). Actual provision is booked by the tax advisor at year-end close; Tally currently reports ₹0 tax.`;

const kpiRows: KpiRow[] = kpiKeyOrder.map((key) => {
  const kpi = financialKPIs[key];
  return {
    label: kpi.label,
    value: formatCurrency(kpi.value, kpi.unit, kpi.currency),
    color: kpi.color,
    sparkline: kpi.sparkline,
    tooltip: key === 'estPat' ? estPatTooltip : undefined,
  };
});

const FinancialKPIs: React.FC = () => {
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();

  return (
    <div
      className="fade-in"
      style={{
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Editorial section title */}
      <div style={{ marginBottom: 14, flexShrink: 0 }}>
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
          Key figures
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
          Year to date · ₹ Crores
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {kpiRows.map((kpi, index) => {
          const isLast = index === kpiRows.length - 1;
          return (
            <div
              key={kpi.label}
              title={kpi.tooltip}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 10 : 12,
                ...(isMobile ? { minHeight: 44 } : {}),
                borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                whiteSpace: isMobile ? undefined : 'nowrap',
                overflow: 'hidden',
                cursor: kpi.tooltip ? 'help' : undefined,
                paddingBlock: isMobile ? 6 : 4,
              }}
              className="fade-in-up"
            >
              <span
                style={{
                  fontFamily: FONTS.caption.family,
                  fontSize: isMobile ? 10 : 9,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                  minWidth: isMobile ? 92 : 108,
                  flexShrink: 0,
                }}
              >
                {kpi.label}
              </span>

              <span
                style={{
                  fontFamily: FONTS.data.family,
                  fontSize: isMobile ? 22 : 26,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums lining-nums',
                  letterSpacing: '-0.01em',
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {kpi.value}
              </span>

              {kpi.sparkline && (
                <Sparkline
                  data={kpi.sparkline}
                  color={mapColor(kpi.color)}
                  width={isMobile ? 48 : 56}
                  height={isMobile ? 18 : 22}
                  animated
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialKPIs;
