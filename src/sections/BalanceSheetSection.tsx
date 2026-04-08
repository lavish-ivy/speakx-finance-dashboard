import { motion } from 'framer-motion';
import { balanceSheetData, assetComposition } from '../data/mockData';
import { useBreakpoint } from '../hooks/useBreakpoint';

const glassCard: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 10,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: 12,
  boxSizing: 'border-box',
};

function formatValue(value: number): string {
  if (value < 0.01 && value > 0) {
    return `₹${(value * 100).toFixed(1)} L`;
  }
  return `₹${value.toFixed(2)} Cr`;
}

interface BSRow {
  metric: string;
  value: number;
  bold: boolean;
}

function BSTable({ title, rows }: { title: string; rows: BSRow[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 9,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 6,
          borderBottom: '1px solid var(--divider)',
          paddingBottom: 4,
        }}
      >
        {title}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.metric}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              style={{
                cursor: 'default',
                borderBottom: row.bold ? '1px solid var(--divider)' : 'none',
              }}
              whileHover={{
                backgroundColor: 'rgba(0,255,204,0.04)',
              }}
            >
              <td
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  color: row.bold ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: row.bold ? 700 : 400,
                  padding: '4px 6px',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                }}
              >
                {row.metric}
              </td>
              <td
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 11,
                  color: row.bold ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: row.bold ? 700 : 400,
                  textAlign: 'right',
                  padding: '4px 6px',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                }}
              >
                {formatValue(row.value)}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssetDonut() {
  const total = assetComposition.segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const cx = 80;
  const cy = 80;

  let accumulated = 0;
  const arcs = assetComposition.segments.map((seg) => {
    const pct = seg.value / total;
    const dashLen = pct * circumference;
    const dashOffset = -(accumulated / total) * circumference;
    accumulated += seg.value;
    return { ...seg, pct, dashLen, dashOffset };
  });

  return (
    <div>
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        Asset Composition
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={160} height={160} style={{ display: 'block' }}>
          <defs>
            {arcs.map((a) => (
              <filter key={`glow-${a.label}`} id={`glow-${a.label.replace(/\s/g, '')}`}>
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          {arcs.map((a) => (
            <motion.circle
              key={a.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${a.dashLen} ${circumference - a.dashLen}`}
              strokeDashoffset={a.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
              filter={`url(#glow-${a.label.replace(/\s/g, '')})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          ))}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize={12}
            fontFamily="'Roboto Mono', monospace"
            fontWeight={700}
          >
            {assetComposition.centerLabel}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={7}
            fontFamily="'Inter', sans-serif"
          >
            Total Assets
          </text>
        </svg>
        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
          {arcs.map((a) => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: a.color }} />
              <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 8, color: 'var(--text-muted)' }}>
                {a.label} {(a.pct * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BalanceSheetSection() {
  const { isMobile } = useBreakpoint();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 12,
      }}
    >
      {/* Left: Balance Sheet Table */}
      <div style={{ ...glassCard, flex: isMobile ? 'unset' : 1 }}>
        <BSTable title="Equity & Liabilities" rows={balanceSheetData.equityAndLiabilities} />
        <BSTable title="Assets" rows={balanceSheetData.assets} />
      </div>
      {/* Right: Asset Donut */}
      <div style={{ ...glassCard, flex: isMobile ? 'unset' : 1 }}>
        <AssetDonut />
      </div>
    </div>
  );
}
