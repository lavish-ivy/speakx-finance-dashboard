import { motion } from 'framer-motion';
import { waterfallData, profitabilityData, debtEquity } from '../data/mockData';
import { useBreakpoint } from '../hooks/useBreakpoint';

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const DEPTH = 6;

const glassCard: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 10,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: 12,
  boxSizing: 'border-box',
};

function formatCr(v: number): string {
  return `₹${v.toFixed(1)} Cr`;
}

function darkenHex(hex: string, factor: number): string {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * factor));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * factor));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * factor));
  return `rgb(${r},${g},${b})`;
}

function lightenHex(hex: string, factor: number): string {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor));
  return `rgb(${r},${g},${b})`;
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

function WaterfallChart() {
  const maxValue = Math.max(...waterfallData.map((d) => d.value));
  const chartHeight = 180;
  const barWidth = 40;
  const gap = 16;
  const totalW = waterfallData.length * (barWidth + gap) - gap;

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg width={totalW + 40} height={chartHeight + 60} style={{ display: 'block', margin: '0 auto' }}>
        {waterfallData.map((bar, i) => {
          const h = (bar.value / maxValue) * chartHeight;
          const x = 20 + i * (barWidth + gap);
          const y = chartHeight - h + 10;
          const nextBar = waterfallData[i + 1];

          return (
            <g key={bar.label}>
              {/* top face */}
              <motion.polygon
                points={`${x},${y} ${x + DEPTH},${y - DEPTH} ${x + barWidth + DEPTH},${y - DEPTH} ${x + barWidth},${y}`}
                fill={lightenHex(bar.color, 1.3)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
              />
              {/* right face */}
              <motion.polygon
                points={`${x + barWidth},${y} ${x + barWidth + DEPTH},${y - DEPTH} ${x + barWidth + DEPTH},${y + h - DEPTH} ${x + barWidth},${y + h}`}
                fill={darkenHex(bar.color, 0.5)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
              />
              {/* front face */}
              <motion.rect
                x={x}
                y={y + h}
                width={barWidth}
                height={0}
                fill={bar.color}
                rx={1}
                initial={{ height: 0, y: y + h }}
                animate={{ height: h, y }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: 'easeOut' }}
                style={{ filter: `drop-shadow(0 0 4px ${bar.color}66)` }}
              />
              {/* value label */}
              <motion.text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={9}
                fontFamily="'Roboto Mono', monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12 + 0.4, duration: 0.3 }}
              >
                {formatCr(bar.value)}
              </motion.text>
              {/* bar label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 26}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={8}
                fontFamily="'Roboto Mono', monospace"
              >
                {bar.label}
              </text>
              {/* connector line */}
              {nextBar && (
                <line
                  x1={x + barWidth + DEPTH}
                  y1={y}
                  x2={x + barWidth + gap}
                  y2={chartHeight - (nextBar.value / maxValue) * chartHeight + 10}
                  stroke="var(--chart-gridline)"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ProfitabilityChart() {
  const opePoints = profitabilityData.ope.points;
  const roaPoints = profitabilityData.roa.points;
  const allVals = [...opePoints, ...roaPoints];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;
  const w = 280;
  const h = 120;
  const padX = 30;
  const padY = 10;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  function toXY(points: number[]) {
    return points.map((v, i) => ({
      x: padX + (i / (points.length - 1)) * chartW,
      y: padY + chartH - ((v - minVal) / range) * chartH,
    }));
  }

  const opeXY = toXY(opePoints);
  const roaXY = toXY(roaPoints);
  const opePath = catmullRomPath(opeXY);
  const roaPath = catmullRomPath(roaXY);

  const opeArea = `${opePath} L${opeXY[opeXY.length - 1].x},${padY + chartH} L${opeXY[0].x},${padY + chartH} Z`;
  const roaArea = `${roaPath} L${roaXY[roaXY.length - 1].x},${padY + chartH} L${roaXY[0].x},${padY + chartH} Z`;

  const ticks = 4;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

  return (
    <div>
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 9,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          marginBottom: 4,
          textTransform: 'uppercase',
        }}
      >
        Profitability Ratios
      </div>
      <svg width={w} height={h + 20} style={{ display: 'block' }}>
        {/* Y-axis ticks */}
        {tickVals.map((tv) => {
          const yy = padY + chartH - ((tv - minVal) / range) * chartH;
          return (
            <g key={tv}>
              <line x1={padX} y1={yy} x2={padX + chartW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padX - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={7} fontFamily="'Roboto Mono', monospace">
                {tv.toFixed(0)}%
              </text>
            </g>
          );
        })}
        {/* area fills */}
        <path d={opeArea} fill={profitabilityData.ope.color} opacity={0.08} />
        <path d={roaArea} fill={profitabilityData.roa.color} opacity={0.08} />
        {/* lines */}
        <motion.path
          d={opePath}
          stroke={profitabilityData.ope.color}
          strokeWidth={1.5}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
        <motion.path
          d={roaPath}
          stroke={profitabilityData.roa.color}
          strokeWidth={1.5}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
        />
        {/* X-axis labels */}
        {MONTHS.map((m, i) => (
          <text
            key={m}
            x={padX + (i / 11) * chartW}
            y={h + 14}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={6}
            fontFamily="'Roboto Mono', monospace"
          >
            {m}
          </text>
        ))}
      </svg>
      {/* legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
        {[profitabilityData.ope, profitabilityData.roa].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 2, backgroundColor: s.color, borderRadius: 1 }} />
            <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 7, color: 'var(--text-muted)' }}>
              {s.label} {s.currentValue}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DebtEquityBar() {
  return (
    <div
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: "'Roboto Mono', monospace",
      }}
    >
      <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
        DEBT/EQUITY
      </span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-deep)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', backgroundColor: '#00FFCC', borderRadius: 3 }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(debtEquity.ratio * 100 * 200, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>{debtEquity.ratio}</span>
    </div>
  );
}

export default function WaterfallSection() {
  const { isMobile } = useBreakpoint();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 12,
      }}
    >
      {/* Left: Waterfall */}
      <div style={{ ...glassCard, flex: isMobile ? 'unset' : 7 }}>
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
          P&L Waterfall
        </div>
        <WaterfallChart />
      </div>
      {/* Right: Profitability + Debt/Equity */}
      <div
        style={{
          flex: isMobile ? 'unset' : 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ ...glassCard, flex: 1 }}>
          <ProfitabilityChart />
        </div>
        <div style={glassCard}>
          <DebtEquityBar />
        </div>
      </div>
    </div>
  );
}
