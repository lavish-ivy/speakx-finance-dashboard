import React, { useState } from 'react';
import { cashFlowData } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const glassCard: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 8,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '16px 20px',
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
};

/* ── KPI chip ──────────────────────────────────────── */

interface KPIChipProps {
  label: string;
  value: number;
  unit: string;
  currency: string;
  color: string;
  isMobile: boolean;
  index: number;
}

function KPIChip({ label, value, unit, currency, color, isMobile, index }: KPIChipProps) {
  return (
    <div
      className="fade-in"
      style={{
        flex: 1,
        minWidth: 0,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: isMobile ? 10 : 8,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? 18 : 16,
          fontWeight: 700,
          color,
          filter: `drop-shadow(0 0 6px ${color}50)`,
          lineHeight: 1,
        }}
      >
        {formatCurrency(value, unit, currency)}
      </div>
    </div>
  );
}

/* ── growUp keyframes (shared) ─────────────────────── */

const barAnimStyleId = 'cf-bar-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(barAnimStyleId)) {
  const style = document.createElement('style');
  style.id = barAnimStyleId;
  style.textContent = `
    @keyframes cfGrowUp {
      from { transform: scaleY(0); }
      to   { transform: scaleY(1); }
    }
  `;
  document.head.appendChild(style);
}

/* ── Monthly OCF Bar Chart ─────────────────────────── */

interface BarChartProps {
  mapColor: (c: string) => string;
  isMobile: boolean;
}

function MonthlyOCFChart({ mapColor, isMobile }: BarChartProps) {
  const { months, data, color } = cashFlowData.monthlyOCF;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxAbs = Math.max(...data.map(Math.abs));
  const barColor = mapColor(color);
  const negColor = mapColor('#FF453A');

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Bar area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 3 : 4,
          position: 'relative',
        }}
      >
        {data.map((val, i) => {
          const isNeg = val < 0;
          const heightPct = (Math.abs(val) / maxAbs) * 50; // 50% = max bar within its half
          const thisBarColor = isNeg ? negColor : barColor;
          const isHov = hoveredIdx === i;

          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Value label above positive bars */}
              {!isNeg && (
                <div
                  style={{
                    textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: isMobile ? 7 : 5,
                    fontWeight: 600,
                    color: thisBarColor,
                    opacity: 0.85,
                    lineHeight: 1,
                    marginBottom: 1,
                    flexShrink: 0,
                  }}
                >
                  {val.toFixed(1)}
                </div>
              )}

              {/* Top half (positive bars grow up from center) */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                {!isNeg && (
                  <div
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? 20 : 28,
                      height: `${heightPct * 2}%`,
                      borderRadius: '3px 3px 0 0',
                      background: `linear-gradient(to bottom, ${thisBarColor}, ${thisBarColor}40)`,
                      filter: isHov
                        ? `drop-shadow(0 0 10px ${thisBarColor}90)`
                        : `drop-shadow(0 0 4px ${thisBarColor}30)`,
                      transformOrigin: 'bottom',
                      animation: `cfGrowUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.06}s both`,
                      cursor: 'pointer',
                    }}
                  />
                )}
              </div>

              {/* Zero line position */}
              <div style={{ height: 1, background: 'var(--chart-gridline)', flexShrink: 0 }} />

              {/* Bottom half (negative bars grow down from center) */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
              >
                {isNeg && (
                  <div
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? 20 : 28,
                      height: `${heightPct * 2}%`,
                      borderRadius: '0 0 3px 3px',
                      background: `linear-gradient(to top, ${thisBarColor}, ${thisBarColor}40)`,
                      filter: isHov
                        ? `drop-shadow(0 0 10px ${thisBarColor}90)`
                        : `drop-shadow(0 0 4px ${thisBarColor}30)`,
                      transformOrigin: 'top',
                      animation: `cfGrowUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.06}s both`,
                      cursor: 'pointer',
                    }}
                  />
                )}
              </div>

              {/* Value label below negative bars */}
              {isNeg && (
                <div
                  style={{
                    textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: isMobile ? 7 : 5,
                    fontWeight: 600,
                    color: thisBarColor,
                    opacity: 0.85,
                    lineHeight: 1,
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                >
                  {val.toFixed(1)}
                </div>
              )}

              {/* Hover tooltip */}
              {isHov && (
                <div
                  style={{
                    position: 'absolute',
                    top: isNeg ? '60%' : '10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--tooltip-bg)',
                    border: `1px solid ${thisBarColor}40`,
                    borderRadius: 4,
                    padding: '3px 6px',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: isMobile ? 11 : 9,
                      fontWeight: 600,
                      color: thisBarColor,
                    }}
                  >
                    ₹{val.toFixed(2)} Cr
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Month labels */}
      <div
        style={{
          display: 'flex',
          gap: isMobile ? 3 : 4,
          marginTop: 4,
          flexShrink: 0,
        }}
      >
        {months.map((m, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: isMobile ? 9 : 7,
              color: 'var(--text-muted)',
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */

export default function CashFlowAnalysis() {
  const [isHovered, setIsHovered] = useState(false);
  const { mapColor } = useTheme();
  const { isMobile } = useBreakpoint();

  /*
   * KPI set: Operating CF → Free CF → Total Liquidity.
   *
   * Net Cash Flow was dropped in the Cash audit because it's a structural
   * identity (equals ΔCash when OCF uses the full indirect method). FCF
   * (OCF − CapEx) is what's actually left after sustaining the business,
   * so it replaces NetCF as the middle chip.
   */
  const kpis = [
    cashFlowData.ytd.ocf,
    cashFlowData.ytd.fcf,
    cashFlowData.ytd.liquidity,
  ];

  return (
    <div
      style={{
        ...glassCard,
        ...(isMobile ? { padding: '16px' } : {}),
        borderColor: isHovered ? 'var(--hover-border)' : 'var(--border-card)',
        boxShadow: isHovered ? 'var(--hover-glow)' : 'none',
        height: '100%',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: isMobile ? 14 : 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-primary)',
          marginBottom: 10,
          flexShrink: 0,
        }}
      >
        CASH FLOW
      </div>

      {/* 3 KPI chips */}
      <div
        style={{
          display: 'flex',
          gap: isMobile ? 12 : 16,
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        {kpis.map((kpi, i) => (
          <KPIChip
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            currency={kpi.currency}
            color={mapColor(kpi.color)}
            isMobile={isMobile}
            index={i}
          />
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--divider), transparent)',
          marginBottom: 8,
          flexShrink: 0,
        }}
      />

      {/* Sub-header */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: isMobile ? 10 : 8,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: 6,
          flexShrink: 0,
        }}
      >
        Monthly Operating Cash Flow
      </div>

      {/* Bar chart */}
      <MonthlyOCFChart mapColor={mapColor} isMobile={isMobile} />
    </div>
  );
}
