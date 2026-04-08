import { motion } from 'framer-motion';
import { cashLiquidityData, cashPositionChart } from '../data/mockData';
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

function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function CashTable() {
  return (
    <div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        marginBottom: 6,
        textTransform: 'uppercase',
      }}>
        Cash & Liquidity
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <tbody>
          {cashLiquidityData.map((row, i) => (
            <motion.tr
              key={`${row.metric}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.35, ease: 'easeOut' }}
              style={{
                cursor: 'default',
                borderBottom: row.bold ? '1px solid var(--divider)' : 'none',
              }}
              whileHover={{ backgroundColor: 'rgba(0,242,255,0.04)' }}
            >
              <td style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: row.bold ? 'var(--text-primary)' : 'rgba(255,255,255,0.7)',
                fontWeight: row.bold ? 700 : 400,
                padding: '4px 6px',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                <div>{row.metric}</div>
                {row.sub && (
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 8,
                    color: 'rgba(255,255,255,0.25)',
                    marginTop: 1,
                  }}>
                    {row.sub}
                  </div>
                )}
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

function CashPositionLineChart() {
  const data = cashPositionChart.totalLiquidity;
  const months = cashPositionChart.months;
  const minVal = Math.min(...data) * 0.9;
  const maxVal = Math.max(...data) * 1.05;
  const range = maxVal - minVal || 1;
  const w = 320;
  const h = 200;
  const padX = 36;
  const padY = 14;
  const cW = w - padX * 2;
  const cH = h - padY * 2;

  const points = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * cW,
    y: padY + cH - ((v - minVal) / range) * cH,
  }));

  const linePath = catmullRomPath(points);
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + cH} L${points[0].x},${padY + cH} Z`;

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

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
        Total Liquidity Trend
      </div>
      <svg viewBox={`0 0 ${w} ${h + 20}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="cashAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FFCC" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#00FFCC" stopOpacity={0.03} />
          </linearGradient>
          <filter id="cashLineGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Y grid + labels */}
        {tickVals.map((tv) => {
          const yy = padY + cH - ((tv - minVal) / range) * cH;
          return (
            <g key={tv}>
              <line x1={padX} y1={yy} x2={padX + cW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padX - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">
                ₹{tv.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Gradient area fill */}
        <motion.path
          d={areaPath}
          fill="url(#cashAreaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />

        {/* Main line with glow */}
        <motion.path
          d={linePath}
          stroke="#00FFCC"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          filter="url(#cashLineGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />

        {/* Data dots */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill="#00FFCC"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i + 0.5, duration: 0.2 }}
            style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,204,0.5))' }}
          />
        ))}

        {/* X labels */}
        {months.map((m, i) => (
          <text
            key={m}
            x={padX + (i / (months.length - 1)) * cW}
            y={h + 14}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={7}
            fontFamily="'JetBrains Mono', monospace"
          >
            {m}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function CashLiquiditySection() {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
      <motion.div
        style={{ ...glassCard, flex: isMobile ? 'unset' : 1 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <CashTable />
      </motion.div>
      <motion.div
        style={{ ...glassCard, flex: isMobile ? 'unset' : 1 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        <CashPositionLineChart />
      </motion.div>
    </div>
  );
}
