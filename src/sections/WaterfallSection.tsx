import { motion } from 'framer-motion';
import { waterfallData, profitabilityData, debtEquity } from '../data/mockData';
import { useBreakpoint } from '../hooks/useBreakpoint';

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

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

function formatCr(v: number): string {
  return `₹${v.toFixed(1)} Cr`;
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

/* ── Waterfall with SVG gradient defs, glow filter, edge highlights ── */

const SVG_W = 480;
const SVG_H = 220;
const PAD_T = 30;
const PAD_B = 22;
const PAD_L = 40;
const PAD_R = 12;
const DEPTH = 6;

const chartW = SVG_W - PAD_L - PAD_R;
const chartH = SVG_H - PAD_T - PAD_B;

function WaterfallChart() {
  const maxVal = Math.max(...waterfallData.map((d) => d.value));
  const barCount = waterfallData.length;
  const gap = 8;
  const barW = (chartW - gap * (barCount - 1)) / barCount;

  const bars = waterfallData.map((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const x = PAD_L + i * (barW + gap);
    const y = PAD_T + chartH - barH;
    return { ...d, barH, x, y, i };
  });

  const yTicks = [
    { label: formatCr(maxVal), frac: 1.0 },
    { label: formatCr(maxVal * 0.75), frac: 0.75 },
    { label: formatCr(maxVal * 0.5), frac: 0.5 },
  ];

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="wfFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22E8F0" />
          <stop offset="40%" stopColor="#0EB5C2" />
          <stop offset="100%" stopColor="#0C2E42" />
        </linearGradient>
        <linearGradient id="wfFrontNet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#18C8D2" />
          <stop offset="45%" stopColor="#0A7888" />
          <stop offset="80%" stopColor="#3D3010" />
          <stop offset="100%" stopColor="#2E2008" />
        </linearGradient>
        <linearGradient id="wfSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A4858" />
          <stop offset="100%" stopColor="#061A24" />
        </linearGradient>
        <linearGradient id="wfTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3EF0F8" />
          <stop offset="100%" stopColor="#18B8C4" />
        </linearGradient>
        <filter id="wfGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feFlood floodColor="#00F2FF" floodOpacity="0.08" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="wfClip">
          <rect x={PAD_L - 2} y={PAD_T - DEPTH - 4} width={chartW + DEPTH + 6} height={chartH + DEPTH + 8} />
        </clipPath>
      </defs>

      {/* Y-axis ticks */}
      {yTicks.map((t) => {
        const ty = PAD_T + chartH - t.frac * chartH;
        return (
          <g key={t.label}>
            <line x1={PAD_L} y1={ty} x2={PAD_L + chartW} y2={ty} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            <text x={PAD_L - 5} y={ty + 3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize={7} fontFamily="'JetBrains Mono', monospace">
              {t.label}
            </text>
          </g>
        );
      })}

      {/* Baseline */}
      <line x1={PAD_L} y1={PAD_T + chartH} x2={PAD_L + chartW} y2={PAD_T + chartH} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />

      {/* Connector lines */}
      {bars.map((b, i) => {
        if (i >= bars.length - 1) return null;
        const next = bars[i + 1];
        return (
          <line
            key={`c-${i}`}
            x1={b.x + barW}
            y1={b.y}
            x2={next.x}
            y2={next.y}
            stroke="rgba(255,255,255,0.10)"
            strokeDasharray="3 2"
            strokeWidth={0.7}
          />
        );
      })}

      {/* Bars with glow + clip */}
      <g clipPath="url(#wfClip)" filter="url(#wfGlow)">
        {bars.map((b) => {
          const isLast = b.i === bars.length - 1;
          const side = [
            `${b.x + barW},${b.y + b.barH}`,
            `${b.x + barW + DEPTH},${b.y + b.barH - DEPTH}`,
            `${b.x + barW + DEPTH},${b.y - DEPTH}`,
            `${b.x + barW},${b.y}`,
          ].join(' ');
          const top = [
            `${b.x},${b.y}`,
            `${b.x + DEPTH},${b.y - DEPTH}`,
            `${b.x + barW + DEPTH},${b.y - DEPTH}`,
            `${b.x + barW},${b.y}`,
          ].join(' ');

          return (
            <g key={b.label}>
              <motion.rect
                x={b.x}
                width={barW}
                fill={isLast ? 'url(#wfFrontNet)' : 'url(#wfFront)'}
                rx={0.5}
                initial={{ y: b.y + b.barH, height: 0 }}
                animate={{ y: b.y, height: b.barH }}
                transition={{ duration: 0.55, delay: 0.15 + b.i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.polygon
                points={side}
                fill="url(#wfSide)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 + b.i * 0.08 }}
              />
              <motion.polygon
                points={top}
                fill="url(#wfTop)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 + b.i * 0.08 }}
              />
              {/* Edge highlight */}
              <motion.line
                x1={b.x}
                y1={b.y + b.barH}
                x2={b.x}
                y2={b.y}
                stroke="rgba(0,242,255,0.12)"
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + b.i * 0.08 }}
              />
            </g>
          );
        })}
      </g>

      {/* Value labels */}
      {bars.map((b) => (
        <motion.text
          key={`v-${b.label}`}
          x={b.x + barW / 2 + DEPTH / 2}
          y={b.y - DEPTH - 5}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={7.5}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={600}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 + b.i * 0.08 }}
        >
          {formatCr(b.value)}
        </motion.text>
      ))}

      {/* X-axis labels */}
      {bars.map((b) => (
        <text
          key={`x-${b.label}`}
          x={b.x + barW / 2}
          y={PAD_T + chartH + 14}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize={7.5}
          fontFamily="'Inter', sans-serif"
        >
          {b.label}
        </text>
      ))}
    </svg>
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
  const h = 140;
  const padX = 30;
  const padY = 10;
  const cW = w - padX * 2;
  const cH = h - padY * 2;

  function toXY(points: number[]) {
    return points.map((v, i) => ({
      x: padX + (i / (points.length - 1)) * cW,
      y: padY + cH - ((v - minVal) / range) * cH,
    }));
  }

  const opeXY = toXY(opePoints);
  const roaXY = toXY(roaPoints);
  const opePath = catmullRomPath(opeXY);
  const roaPath = catmullRomPath(roaXY);
  const opeArea = `${opePath} L${opeXY[opeXY.length - 1].x},${padY + cH} L${opeXY[0].x},${padY + cH} Z`;
  const roaArea = `${roaPath} L${roaXY[roaXY.length - 1].x},${padY + cH} L${roaXY[0].x},${padY + cH} Z`;

  const ticks = 4;
  const tickVals = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i);

  return (
    <div>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>
        Profitability Ratios
      </div>
      <svg viewBox={`0 0 ${w} ${h + 20}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="opeAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={profitabilityData.ope.color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={profitabilityData.ope.color} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="roaAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={profitabilityData.roa.color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={profitabilityData.roa.color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {tickVals.map((tv) => {
          const yy = padY + cH - ((tv - minVal) / range) * cH;
          return (
            <g key={tv}>
              <line x1={padX} y1={yy} x2={padX + cW} y2={yy} stroke="var(--chart-gridline)" strokeWidth={0.5} />
              <text x={padX - 4} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize={7} fontFamily="'JetBrains Mono', monospace">{tv.toFixed(0)}%</text>
            </g>
          );
        })}
        <path d={opeArea} fill="url(#opeAreaGrad)" />
        <path d={roaArea} fill="url(#roaAreaGrad)" />
        <motion.path d={opePath} stroke={profitabilityData.ope.color} strokeWidth={1.5} fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
        <motion.path d={roaPath} stroke={profitabilityData.roa.color} strokeWidth={1.5} fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.15 }} />
        {MONTHS.map((m, i) => (
          <text key={m} x={padX + (i / 11) * cW} y={h + 14} textAnchor="middle" fill="var(--text-muted)" fontSize={6} fontFamily="'JetBrains Mono', monospace">{m}</text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
        {[profitabilityData.ope, profitabilityData.roa].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 14, height: 2, backgroundColor: s.color, borderRadius: 1 }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'var(--text-muted)' }}>{s.label} {s.currentValue}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DebtEquityBar() {
  const pct = Math.min(debtEquity.ratio * 100, 100);
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>DEBT/EQUITY</span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-deep)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', backgroundColor: '#00FFCC', borderRadius: 3, boxShadow: '0 0 6px rgba(0,255,204,0.3)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, textShadow: '0 0 6px rgba(0,242,255,0.15)' }}>
        {debtEquity.ratio}
      </span>
    </div>
  );
}

export default function WaterfallSection() {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
      <motion.div
        style={{ ...glassCard, flex: isMobile ? 'unset' : 7 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
          P&L Waterfall
        </div>
        <WaterfallChart />
      </motion.div>
      <div style={{ flex: isMobile ? 'unset' : 3, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <motion.div
          style={{ ...glassCard, flex: 1 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <ProfitabilityChart />
        </motion.div>
        <motion.div
          style={glassCard}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          <DebtEquityBar />
        </motion.div>
      </div>
    </div>
  );
}
