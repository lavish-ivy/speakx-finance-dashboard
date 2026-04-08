import React from 'react';
import { financialKPIs } from '../../data/mockData';
import { formatCurrency, formatPercent } from '../../utils/formatCurrency';
type KPIKey = keyof typeof financialKPIs;
import Sparkline from '../shared/Sparkline';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface KpiRow {
  label: string;
  value: string;
  color: string;
  sparkline: number[] | null;
  isPercent: boolean;
}

/* Ordered: Revenue → Other Income → Total Income → Total Expenses → Net Profit → Net Margin */
const kpiKeyOrder: KPIKey[] = ['revenue', 'otherIncome', 'totalIncome', 'totalExpenses', 'netProfit', 'netMargin'];

const kpiLabels: Record<KPIKey, string> = {
  revenue: 'REVENUE',
  otherIncome: 'OTHER INCOME',
  totalIncome: 'TOTAL INCOME',
  totalExpenses: 'TOTAL EXPENSES',
  netProfit: 'NET PROFIT',
  netMargin: 'NET MARGIN',
};

const kpiRows: KpiRow[] = kpiKeyOrder.map((key) => {
  const kpi = financialKPIs[key];
  const isPercent = kpi.unit === '%';
  return {
    label: kpiLabels[key],
    value: isPercent
      ? formatPercent(kpi.value)
      : formatCurrency(kpi.value, kpi.unit, 'currency' in kpi ? kpi.currency : '₹'),
    color: kpi.color,
    sparkline: kpi.sparkline,
    isPercent,
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
                minWidth: isMobile ? 80 : 105,
                flexShrink: 0,
              }}
            >
              {kpi.label}:
            </span>

            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: kpi.isPercent ? (isMobile ? 18 : 20) : (isMobile ? 22 : 28),
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
