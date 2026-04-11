import React from 'react';
import { financialKPIs, estTaxProvision } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
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
 * Ordering: Revenue → Other Income → Total Income → Total Expenses → PBT → Est. PAT
 *
 * Previously this strip showed a single "NET PROFIT" row sourced from monthlyPAT,
 * which equals PBT in the raw Tally data because the year-end tax provision is
 * not booked monthly. That was a silent mislabel — the HUD's top-line number
 * was pre-tax but presented as post-tax. The final two rows now expose the
 * same "Booked PBT vs Estimated PAT @115BAA" framing the P&L page uses.
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
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 8,
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '16px' : '16px 20px',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: isMobile ? 14 : 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-primary)',
          marginBottom: 10,
          flexShrink: 0,
        }}
      >
        FINANCIAL KPIs
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {kpiRows.map((kpi, index) => (
          <div
            key={kpi.label}
            title={kpi.tooltip}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 6 : 8,
              ...(isMobile ? { minHeight: 40 } : {}),
              borderBottom:
                index < kpiRows.length - 1
                  ? '1px solid var(--divider)'
                  : 'none',
              whiteSpace: isMobile ? undefined : 'nowrap',
              overflow: 'hidden',
              cursor: kpi.tooltip ? 'help' : undefined,
            }}
            className="fade-in-up"
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: isMobile ? 12 : 9,
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                minWidth: isMobile ? 80 : 115,
                flexShrink: 0,
              }}
            >
              {kpi.label}:
            </span>

            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: isMobile ? 22 : 28,
                fontWeight: 700,
                color: mapColor(kpi.color),
                filter: `drop-shadow(0 0 8px ${mapColor(kpi.color)}66)`,
                lineHeight: 1,
              }}
            >
              {kpi.value}
            </span>

            {kpi.sparkline && (
              <Sparkline data={kpi.sparkline} color={mapColor(kpi.color)} width={isMobile ? 50 : 60} height={isMobile ? 18 : 22} animated />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialKPIs;
