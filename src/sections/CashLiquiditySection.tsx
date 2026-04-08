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
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          marginBottom: 6,
          textTransform: 'uppercase',
        }}
      >
        Cash & Liquidity
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {cashLiquidityData.map((row, i) => (
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
                <div>{row.metric}</div>
                {row.sub && (
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8,
                      color: 'var(--text-muted)',
                      marginTop: 1,
                    }}
                  >
                    {row.sub}
                  </div>
                )}
              </td>
              <td
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: row.bold ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: row.bold ? 700 : 400,
                  textAlign: 'right',
                  padding: '4px 6px',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  whiteSpace: 'nowrap',
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

function CashPositionLineChart() {
  const data = cashPositionChart.totalLiquidity;
  const months = cashPositionChart.months;
  const minVal = Math.min(...data) * 0.9;
  const maxVal = Math.max(...data) * 1.05;
  const range = maxVal - minVal || 1;
  const w = 320;
  const h = 180;
  const padX = 36;
  const padY = 14;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const points = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - ((v - minVal) / range) * chartH,
  }));

  const linePath = catmullRomPath(points);
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`;

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

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
        Total Liquidity Trend
      </div>
      <svg width={w} height={h + 20} style={{ display: 'block', width: '100%' }} viewBox={`0 0 ${w} ${h + 20}`}>
        {/* Y grid + labels */}
        {tickVals.map((tv) => {
          const yy = padY + chartH - ((tv - minVal) / range) * chartH;
          return (
            <g key={tv}>
              <line x1={padX} y1={yy} x2={padX + chartW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padX - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">
                ₹{tv.toFixed(0)}
              </text>
            </g>
          );
        })}
        {/* area */}
        <path d={areaPath} fill="#00FFCC" opacity={0.06} />
        {/* line */}
        <motion.path
          d={linePath}
          stroke="#00FFCC"
          strokeWidth={2}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,204,0.5))' }}
        />
        {/* dots */}
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
          />
        ))}
        {/* X labels */}
        {months.map((m, i) => (
          <text
            key={m}
            x={padX + (i / (months.length - 1)) * chartW}
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
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 12,
      }}
    >
      <div style={{ ...glassCard, flex: isMobile ? 'unset' : 1 }}>
        <CashTable />
      </div>
      <div style={{ ...glassCard, flex: isMobile ? 'unset' : 1 }}>
        <CashPositionLineChart />
      </div>
    </div>
  );
}
