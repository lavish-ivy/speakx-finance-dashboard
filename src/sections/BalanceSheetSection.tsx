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
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
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
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 9,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 6,
        borderBottom: '1px solid var(--divider)',
        paddingBottom: 4,
      }}>
        {title}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.metric}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35, ease: 'easeOut' }}
              style={{
                cursor: 'default',
                borderBottom: row.bold ? '1px solid var(--divider)' : 'none',
              }}
              whileHover={{ backgroundColor: 'rgba(0,242,255,0.06)' }}
            >
              <td style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: row.bold ? 'var(--text-primary)' : 'rgba(255,255,255,0.7)',
                fontWeight: row.bold ? 700 : 400,
                padding: '4px 6px',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                width: '60%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {row.metric}
              </td>
              <td style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: row.bold ? 'var(--text-primary)' : 'rgba(255,255,255,0.7)',
                fontWeight: row.bold ? 700 : 400,
                textAlign: 'right',
                padding: '4px 6px',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                whiteSpace: 'nowrap',
              }}>
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
  const bloomRadius = 68;
  const strokeWidth = 14;
  const bloomStroke = 22;
  const circumference = 2 * Math.PI * radius;
  const bloomCircumference = 2 * Math.PI * bloomRadius;
  const cx = 80;
  const cy = 80;
  const gapDeg = 2;
  const gapFrac = gapDeg / 360;
  const gapLen = gapFrac * circumference;

  let accumulated = 0;
  const arcs = assetComposition.segments.map((seg) => {
    const pct = seg.value / total;
    const dashLen = Math.max(0, pct * circumference - gapLen);
    const dashOffset = -(accumulated / total) * circumference;
    const bloomDashLen = Math.max(0, pct * bloomCircumference - gapLen);
    const bloomDashOffset = -(accumulated / total) * bloomCircumference;
    accumulated += seg.value;
    return { ...seg, pct, dashLen, dashOffset, bloomDashLen, bloomDashOffset };
  });

  return (
    <div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        Asset Composition
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={160} height={160} style={{ display: 'block' }}>
          <defs>
            {arcs.map((a) => (
              <filter key={`bloom-${a.label}`} id={`bloom-${a.label.replace(/\s/g, '')}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Bloom rings — larger, semi-transparent glow behind main segments */}
          {arcs.map((a) => (
            <motion.circle
              key={`bloom-${a.label}`}
              cx={cx}
              cy={cy}
              r={bloomRadius}
              fill="none"
              stroke={a.color}
              strokeWidth={bloomStroke}
              strokeDasharray={`${a.bloomDashLen} ${bloomCircumference - a.bloomDashLen}`}
              strokeDashoffset={a.bloomDashOffset}
              strokeLinecap="butt"
              opacity={0.12}
              transform={`rotate(-90 ${cx} ${cy})`}
              initial={{ strokeDasharray: `0 ${bloomCircumference}` }}
              animate={{ strokeDasharray: `${a.bloomDashLen} ${bloomCircumference - a.bloomDashLen}` }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          ))}

          {/* Main donut segments */}
          {arcs.map((a, i) => (
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
              filter={`url(#bloom-${a.label.replace(/\s/g, '')})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          ))}

          {/* Center label */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize={12}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight={700}
              style={{ textShadow: '0 0 12px rgba(255,255,255,0.35)' }}
            >
              {assetComposition.centerLabel}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize={7} fontFamily="'Inter', sans-serif">
              Total Assets
            </text>
          </motion.g>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
          {arcs.map((a) => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: a.color }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>
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
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
      <motion.div
        style={{ ...glassCard, flex: isMobile ? 'unset' : 1 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <BSTable title="Equity & Liabilities" rows={balanceSheetData.equityAndLiabilities} />
        <BSTable title="Assets" rows={balanceSheetData.assets} />
      </motion.div>
      <motion.div
        style={{ ...glassCard, flex: isMobile ? 'unset' : 1 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        <AssetDonut />
      </motion.div>
    </div>
  );
}
