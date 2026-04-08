import { motion } from 'framer-motion';
import { historicalTrendsData, equityTrend } from '../data/mockData';
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

function HistoricalTrendsChart() {
  const { months, series } = historicalTrendsData;
  const allVals = series.flatMap((s) => s.points);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;
  const w = 380;
  const h = 200;
  const padX = 36;
  const padY = 14;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  function toXY(points: number[]) {
    return points.map((v, i) => ({
      x: padX + (i / (points.length - 1)) * chartW,
      y: padY + chartH - ((v - minVal) / range) * chartH,
    }));
  }

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
        Historical P&L Trends
      </div>
      <svg width={w} height={h + 20} style={{ display: 'block', width: '100%' }} viewBox={`0 0 ${w} ${h + 20}`}>
        {/* Y grid */}
        {tickVals.map((tv) => {
          const yy = padY + chartH - ((tv - minVal) / range) * chartH;
          return (
            <g key={tv}>
              <line x1={padX} y1={yy} x2={padX + chartW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padX - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={7} fontFamily="'Roboto Mono', monospace">
                ₹{tv.toFixed(1)}
              </text>
            </g>
          );
        })}
        {/* series */}
        {series.map((s, si) => {
          const pts = toXY(s.points);
          const linePath = catmullRomPath(pts);
          const areaPath = `${linePath} L${pts[pts.length - 1].x},${padY + chartH} L${pts[0].x},${padY + chartH} Z`;
          return (
            <g key={s.label}>
              <path d={areaPath} fill={s.color} opacity={0.06} />
              <motion.path
                d={linePath}
                stroke={s.color}
                strokeWidth={1.5}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: si * 0.2 }}
                style={{ filter: `drop-shadow(0 0 3px ${s.color}66)` }}
              />
            </g>
          );
        })}
        {/* X labels */}
        {months.map((m, i) => (
          <text
            key={m}
            x={padX + (i / (months.length - 1)) * chartW}
            y={h + 14}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={7}
            fontFamily="'Roboto Mono', monospace"
          >
            {m}
          </text>
        ))}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
        {series.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 2, backgroundColor: s.color, borderRadius: 1 }} />
            <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 8, color: 'var(--text-muted)' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EquityTrendChart() {
  const { months, data, color } = equityTrend;
  const minVal = Math.min(...data) * 0.95;
  const maxVal = Math.max(...data) * 1.03;
  const range = maxVal - minVal || 1;
  const w = 240;
  const h = 200;
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

  const ticks = 4;
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
        Equity Trend (Capital Account)
      </div>
      <svg width={w} height={h + 20} style={{ display: 'block', width: '100%' }} viewBox={`0 0 ${w} ${h + 20}`}>
        {/* Y grid */}
        {tickVals.map((tv) => {
          const yy = padY + chartH - ((tv - minVal) / range) * chartH;
          return (
            <g key={tv}>
              <line x1={padX} y1={yy} x2={padX + chartW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padX - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={7} fontFamily="'Roboto Mono', monospace">
                ₹{tv.toFixed(0)}
              </text>
            </g>
          );
        })}
        {/* area */}
        <path d={areaPath} fill={color} opacity={0.08} />
        {/* line */}
        <motion.path
          d={linePath}
          stroke={color}
          strokeWidth={2}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          style={{ filter: `drop-shadow(0 0 3px ${color}88)` }}
        />
        {/* dots for fundraise jumps */}
        {points.map((p, i) => {
          const isJump = i > 0 && data[i] - data[i - 1] > 10;
          if (!isJump) return null;
          return (
            <g key={i}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={7}
                fontFamily="'Roboto Mono', monospace"
              >
                ₹{data[i].toFixed(0)} Cr
              </text>
            </g>
          );
        })}
        {/* X labels */}
        {months.map((m, i) => (
          <text
            key={m}
            x={padX + (i / (months.length - 1)) * chartW}
            y={h + 14}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={7}
            fontFamily="'Roboto Mono', monospace"
          >
            {m}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function TrendsSection() {
  const { isMobile } = useBreakpoint();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 12,
      }}
    >
      <div style={{ ...glassCard, flex: isMobile ? 'unset' : 6 }}>
        <HistoricalTrendsChart />
      </div>
      <div style={{ ...glassCard, flex: isMobile ? 'unset' : 4 }}>
        <EquityTrendChart />
      </div>
    </div>
  );
}
