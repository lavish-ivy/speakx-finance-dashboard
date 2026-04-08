import React from 'react';
import { qoqGrowth, additionalMetrics } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTheme } from '../../theme/ThemeContext';

interface QoQGrowthProps {
  isMobile?: boolean;
}

const QoQGrowth: React.FC<QoQGrowthProps> = ({ isMobile = false }) => {
  const { mapColor } = useTheme();

  const growthItems = [
    { label: qoqGrowth.revenue.label, value: qoqGrowth.revenue.change, color: qoqGrowth.revenue.color },
    { label: qoqGrowth.opex.label, value: qoqGrowth.opex.change, color: qoqGrowth.opex.color },
    { label: qoqGrowth.netPnl.label, value: qoqGrowth.netPnl.change, color: qoqGrowth.netPnl.color },
  ];

  const metricItems = [
    {
      label: additionalMetrics.totalExpenses.label,
      value: formatCurrency(
        additionalMetrics.totalExpenses.value,
        additionalMetrics.totalExpenses.unit,
        additionalMetrics.totalExpenses.currency
      ),
      color: additionalMetrics.totalExpenses.color,
    },
    {
      label: additionalMetrics.otherIncome.label,
      value: formatCurrency(
        additionalMetrics.otherIncome.value,
        additionalMetrics.otherIncome.unit,
        additionalMetrics.otherIncome.currency
      ),
      color: additionalMetrics.otherIncome.color,
    },
  ];

  return (
    <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: isMobile ? 13 : 9,
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        QoQ Growth
      </div>

      {/* Growth items - inline label + value */}
      <div style={{ flexShrink: 0 }}>
        {growthItems.map((item, i) => (
          <div
            key={item.label}
            className="fade-in-left"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 6,
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <span
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: isMobile ? 11 : 8,
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: isMobile ? 13 : 10,
                fontWeight: 600,
                color: mapColor(item.color),
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid var(--divider)',
          margin: isMobile ? '10px 0 12px' : '6px 0 8px',
          flexShrink: 0,
        }}
      />

      {/* Metric items - stacked label above value */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: isMobile ? 10 : 16, minHeight: 0 }}>
        {metricItems.map((item, i) => (
          <div
            key={item.label}
            className="fade-in-left"
            style={{
              animationDelay: `${(growthItems.length + i) * 0.08}s`,
            }}
          >
            <div
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: isMobile ? 11 : 9,
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-muted)',
                marginBottom: 2,
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: isMobile ? 24 : 36,
                fontWeight: 700,
                color: mapColor(item.color),
                filter: `drop-shadow(0 0 8px ${mapColor(item.color)}50)`,
                lineHeight: 1,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QoQGrowth;
