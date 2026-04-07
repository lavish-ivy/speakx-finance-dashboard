import React from 'react';
import { financialKPIs } from '../../data/mockData';
import { formatCurrency, formatPercent } from '../../utils/formatCurrency';
import Sparkline from '../shared/Sparkline';
import QoQGrowth from './QoQGrowth';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface KpiRow {
  label: string;
  value: string;
  color: string;
  sparkline: number[] | null;
  isPercent: boolean;
}

const kpiRows: KpiRow[] = [
  {
    label: 'REVENUE',
    value: formatCurrency(financialKPIs.revenue.value, financialKPIs.revenue.unit, financialKPIs.revenue.currency),
    color: financialKPIs.revenue.color,
    sparkline: financialKPIs.revenue.sparkline,
    isPercent: false,
  },
  {
    label: 'GROSS MARGIN',
    value: formatPercent(financialKPIs.grossMargin.value),
    color: financialKPIs.grossMargin.color,
    sparkline: financialKPIs.grossMargin.sparkline,
    isPercent: true,
  },
  {
    label: 'EBITDA',
    value: formatCurrency(financialKPIs.ebitda.value, financialKPIs.ebitda.unit, financialKPIs.ebitda.currency),
    color: financialKPIs.ebitda.color,
    sparkline: financialKPIs.ebitda.sparkline,
    isPercent: false,
  },
  {
    label: 'EBITDA MARGIN',
    value: formatPercent(financialKPIs.ebitdaMargin.value),
    color: financialKPIs.ebitdaMargin.color,
    sparkline: financialKPIs.ebitdaMargin.sparkline,
    isPercent: true,
  },
  {
    label: 'NET INCOME',
    value: formatCurrency(financialKPIs.netIncome.value, financialKPIs.netIncome.unit, financialKPIs.netIncome.currency),
    color: financialKPIs.netIncome.color,
    sparkline: financialKPIs.netIncome.sparkline,
    isPercent: false,
  },
];

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
        padding: isMobile ? '12px 14px' : '16px 20px',
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
          fontSize: 11,
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

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left: KPI rows */}
        <div style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {kpiRows.map((kpi, index) => (
            <div
              key={kpi.label}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
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
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 9,
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
                  fontSize: kpi.isPercent ? (isMobile ? 16 : 20) : (isMobile ? 22 : 28),
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

        {/* Separator */}
        {isMobile
          ? <div style={{ height: 1, background: 'var(--border-subtle)', flexShrink: 0 }} />
          : <div style={{ width: 1, background: 'var(--border-subtle)', flexShrink: 0 }} />
        }

        {/* Right: QoQ Growth */}
        <div style={{ flex: 1.2, minWidth: 0, overflow: 'hidden', ...(isMobile ? { paddingTop: 12 } : {}) }}>
          <QoQGrowth isMobile={isMobile} />
        </div>
      </div>
    </div>
  );
};

export default FinancialKPIs;
