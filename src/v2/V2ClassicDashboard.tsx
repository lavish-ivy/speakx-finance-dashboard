import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { colors, typography } from './tokens';
import GlassCard from './GlassCard';
import {
  kpiData, waterfallData, profitabilityData,
  balanceSheetTableData, assetComposition,
  cashLiquidityTableData, cashPositionChart,
  complianceData, varianceRadarData,
  historicalTrendsData, debtEquity,
} from './v2Data';

// ── Responsive hook ──
function useResponsive() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 768, isTablet: w < 1024 };
}

// ── Helpers ──
const fade = (d = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: d } });
const S = { section: { marginBottom: 28 } as const, title: { fontFamily: typography.heading, fontSize: 15, color: colors.cyan, textTransform: 'uppercase' as const, letterSpacing: 2, marginBottom: 14 } };

// Catmull-Rom to cubic bezier path
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

// ── Background: GridFloor ──
function GridFloor() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, perspective: 800, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', bottom: 0, left: '-50%', width: '200%', height: '60%',
        transformStyle: 'preserve-3d', transform: 'rotateX(65deg)',
        backgroundImage: `linear-gradient(${colors.cyan}15 1px, transparent 1px), linear-gradient(90deg, ${colors.cyan}15 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
    </div>
  );
}

// ── Background: AmbientParticles ──
function AmbientParticles() {
  const dots = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    dur: 12 + Math.random() * 20, delay: Math.random() * 8, size: 1.5 + Math.random() * 2,
  })), []);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {dots.map(d => (
        <motion.div key={d.id} style={{
          position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size,
          borderRadius: '50%', background: colors.cyan, boxShadow: `0 0 6px ${colors.cyan}`,
        }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Header ──
function Header() {
  return (
    <motion.header {...fade()} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 0', marginBottom: 20, borderBottom: `1px solid ${colors.bgCardBorder}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${colors.cyan}, ${colors.magenta})`, display: 'grid', placeItems: 'center' }}>
          <span style={{ fontFamily: typography.heading, fontWeight: 700, fontSize: 14, color: '#000' }}>SX</span>
        </div>
        <span style={{ fontFamily: typography.heading, fontSize: 20, fontWeight: 700, color: colors.textPrimary, textShadow: `0 0 20px ${colors.cyan}40` }}>SPEAKX</span>
        <span style={{ fontFamily: typography.mono, fontSize: 11, color: colors.textMuted, marginLeft: 6 }}>FINANCE HQ</span>
      </div>
      <div style={{ fontFamily: typography.mono, fontSize: 11, color: colors.textSecondary }}>
        FY 2025-26 &middot; LIVE
        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: colors.neonGreen, marginLeft: 6, boxShadow: `0 0 8px ${colors.neonGreen}` }} />
      </div>
    </motion.header>
  );
}

// ── KPI Strip ──
function KPIStrip({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, ...S.section, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
      {kpiData.map((k, i) => (
        <GlassCard key={k.id} style={{ flex: isMobile ? '1 1 45%' : '1 1 0', minWidth: 140, padding: '14px 16px', borderColor: k.highlight ? colors.cyan + '50' : undefined }}>
          <motion.div {...fade(i * 0.08)}>
            <div style={{ fontFamily: typography.mono, fontSize: 10, color: colors.textMuted, marginBottom: 4, letterSpacing: 1 }}>{k.label}</div>
            <div style={{ fontFamily: typography.heading, fontSize: 26, fontWeight: 700, color: k.highlight ? colors.cyan : colors.textPrimary }}>
              {k.prefix}{typeof k.value === 'number' ? k.value.toFixed(2) : k.value}<span style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 3 }}>{k.unit}</span>
            </div>
          </motion.div>
        </GlassCard>
      ))}
    </div>
  );
}

// ── Waterfall 3D Chart ──
function WaterfallChart() {
  const W = 520, H = 260, pad = 50, barW = 40, depth = 14;
  const maxV = Math.max(...waterfallData.map(d => Math.abs(d.value)));
  const scale = (H - pad * 2) / maxV;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="wfBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.barGradientTop} />
          <stop offset="100%" stopColor={colors.barGradientBot} />
        </linearGradient>
      </defs>
      {waterfallData.map((d, i) => {
        const x = pad + i * ((W - pad * 2) / waterfallData.length) + 8;
        const barH = Math.abs(d.value) * scale * 0.7;
        const y = H - pad - barH;
        const col = d.color || colors.cyan;
        return (
          <g key={i}>
            {/* front */}
            <motion.rect x={x} y={y} width={barW} height={barH} fill={col} rx={2}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, delay: i * 0.07 }}
              style={{ transformOrigin: `${x + barW / 2}px ${H - pad}px` }} opacity={0.85} />
            {/* top face */}
            <motion.polygon points={`${x},${y} ${x + depth},${y - depth} ${x + barW + depth},${y - depth} ${x + barW},${y}`}
              fill={col} opacity={0.5} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: i * 0.07 + 0.3 }} />
            {/* right face */}
            <motion.polygon points={`${x + barW},${y} ${x + barW + depth},${y - depth} ${x + barW + depth},${y + barH - depth} ${x + barW},${y + barH}`}
              fill={col} opacity={0.3} initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: i * 0.07 + 0.3 }} />
            <text x={x + barW / 2} y={H - pad + 16} textAnchor="middle" fontSize={9} fill={colors.textMuted} fontFamily={typography.mono}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Profitability Dual-Line ──
function ProfitabilityChart() {
  const W = 280, H = 180, pad = 30;
  const { ope, roa } = profitabilityData;
  const allPts = [...ope.points, ...roa.points];
  const minV = Math.min(...allPts), maxV = Math.max(...allPts);
  const range = maxV - minV || 1;
  const mapPts = (pts: number[]) => pts.map((v, i) => ({ x: pad + i * ((W - pad * 2) / (pts.length - 1)), y: pad + (1 - (v - minV) / range) * (H - pad * 2) }));
  const opePts = mapPts(ope.points), roaPts = mapPts(roa.points);
  const opeD = smoothPath(opePts), roaD = smoothPath(roaPts);
  const areaOpe = opeD + ` L${opePts[opePts.length - 1].x},${H - pad} L${opePts[0].x},${H - pad} Z`;
  const areaRoa = roaD + ` L${roaPts[roaPts.length - 1].x},${H - pad} L${roaPts[0].x},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="opeArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors.cyan} stopOpacity={0.25} /><stop offset="100%" stopColor={colors.cyan} stopOpacity={0} /></linearGradient>
        <linearGradient id="roaArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors.magenta} stopOpacity={0.25} /><stop offset="100%" stopColor={colors.magenta} stopOpacity={0} /></linearGradient>
      </defs>
      <motion.path d={areaOpe} fill="url(#opeArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.path d={areaRoa} fill="url(#roaArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.path d={opeD} fill="none" stroke={colors.cyan} strokeWidth={2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      <motion.path d={roaD} fill="none" stroke={colors.magenta} strokeWidth={2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2 }} />
      {/* legend */}
      <circle cx={pad} cy={12} r={4} fill={colors.cyan} /><text x={pad + 8} y={15} fontSize={9} fill={colors.textSecondary} fontFamily={typography.mono}>{ope.label} {ope.currentValue}%</text>
      <circle cx={pad + 130} cy={12} r={4} fill={colors.magenta} /><text x={pad + 138} y={15} fontSize={9} fill={colors.textSecondary} fontFamily={typography.mono}>{roa.label} {roa.currentValue}%</text>
    </svg>
  );
}

// ── Data Table ──
function DataTable({ rows }: { rows: { metric: string; current: string; projected: string; bold?: boolean; sub?: string }[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: typography.mono, fontSize: 11 }}>
      <thead>
        <tr>{['METRIC', 'CURRENT', 'PROJECTED'].map(h => (
          <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: `1px solid ${colors.tableBorder}`, color: colors.textMuted, fontSize: 9, letterSpacing: 1 }}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? colors.tableRowEven : 'transparent' }}>
            <td style={{ padding: '5px 8px', color: r.bold ? colors.textPrimary : colors.textSecondary, fontWeight: r.bold ? 600 : 400 }}>
              {r.metric}
              {r.sub && <span style={{ fontSize: 8, color: colors.textMuted, marginLeft: 4 }}>{r.sub}</span>}
            </td>
            <td style={{ padding: '5px 8px', color: colors.textSecondary }}>{r.current}</td>
            <td style={{ padding: '5px 8px', color: colors.textMuted }}>{r.projected}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Asset Donut ──
function AssetDonut() {
  const { centerLabel, segments } = assetComposition;
  const total = segments.reduce((s, g) => s + g.value, 0);
  const R = 60, cx = 80, cy = 80, sw = 18;
  let offset = 0;
  return (
    <svg viewBox="0 0 160 160" width="100%" style={{ display: 'block', maxWidth: 200, margin: '0 auto' }}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = 2 * Math.PI * R * pct;
        const gap = 2 * Math.PI * R * (1 - pct);
        const o = offset;
        offset += pct;
        return (
          <g key={i}>
            <motion.circle cx={cx} cy={cy} r={R} fill="none" stroke={seg.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-2 * Math.PI * R * o}
              transform={`rotate(-90 ${cx} ${cy})`} opacity={0.85}
              initial={{ strokeDasharray: `0 ${2 * Math.PI * R}` }}
              animate={{ strokeDasharray: `${dash} ${gap}` }}
              transition={{ duration: 1, delay: i * 0.15 }} />
            {/* bloom ring */}
            <motion.circle cx={cx} cy={cy} r={R} fill="none" stroke={seg.color} strokeWidth={sw + 8}
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-2 * Math.PI * R * o}
              transform={`rotate(-90 ${cx} ${cy})`} opacity={0.08} />
          </g>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill={colors.textMuted} fontFamily={typography.mono}>{centerLabel}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={14} fontWeight={700} fill={colors.textPrimary} fontFamily={typography.heading}>100%</text>
    </svg>
  );
}

// ── Cash Position Chart ──
function CashPositionLineChart() {
  const { xLabels, historic, projection } = cashPositionChart;
  const W = 340, H = 160, pad = 32;
  const allV = historic.filter((v): v is number => v !== null);
  const maxV = Math.max(...allV), minV = Math.min(...allV);
  const range = maxV - minV || 1;
  const px = (i: number) => pad + i * ((W - pad * 2) / (xLabels.length - 1));
  const py = (v: number) => pad + (1 - (v - minV) / range) * (H - pad * 2);
  const hPts = historic.map((v, i) => v !== null ? { x: px(i), y: py(v) } : null).filter(Boolean) as { x: number; y: number }[];
  const pPts = projection.map((v, i) => v !== null ? { x: px(i), y: py(v) } : null).filter(Boolean) as { x: number; y: number }[];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="cashArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors.cyan} stopOpacity={0.2} /><stop offset="100%" stopColor={colors.cyan} stopOpacity={0} /></linearGradient>
      </defs>
      {hPts.length > 1 && <>
        <motion.path d={smoothPath(hPts) + ` L${hPts[hPts.length - 1].x},${H - pad} L${hPts[0].x},${H - pad} Z`} fill="url(#cashArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path d={smoothPath(hPts)} fill="none" stroke={colors.cyan} strokeWidth={2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      </>}
      {pPts.length > 1 && <motion.path d={smoothPath(pPts)} fill="none" stroke={colors.magenta} strokeWidth={2} strokeDasharray="6 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.4 }} />}
      {xLabels.map((l, i) => i % 2 === 0 && <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize={8} fill={colors.textMuted} fontFamily={typography.mono}>{l}</text>)}
    </svg>
  );
}

// ── Compliance Donut ──
function ComplianceDonut() {
  const { value, max } = complianceData;
  const pct = value / max;
  const R = 52, cx = 64, cy = 64, sw = 10;
  const circ = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 128 128" width="100%" style={{ display: 'block', maxWidth: 140, margin: '0 auto' }}>
      <defs>
        <linearGradient id="compGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={colors.cyan} /><stop offset="100%" stopColor={colors.neonGreen} /></linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={colors.bgCardBorder} strokeWidth={sw} />
      <motion.circle cx={cx} cy={cy} r={R} fill="none" stroke="url(#compGrad)" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`} transform={`rotate(-90 ${cx} ${cy})`}
        initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${circ * pct} ${circ * (1 - pct)}` }}
        transition={{ duration: 1.2 }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={18} fontWeight={700} fill={colors.textPrimary} fontFamily={typography.heading}>{value}%</text>
    </svg>
  );
}

// ── Variance Radar ──
function VarianceRadar() {
  const { axes, values } = varianceRadarData;
  const n = axes.length, cx = 80, cy = 80, R = 56;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const gridPt = (i: number, r: number) => `${cx + Math.cos(angle(i)) * r},${cy + Math.sin(angle(i)) * r}`;
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPts = values.map((v, i) => gridPt(i, (v / 100) * R)).join(' ');
  return (
    <svg viewBox="0 0 160 160" width="100%" style={{ display: 'block', maxWidth: 180, margin: '0 auto' }}>
      {gridLevels.map(l => (
        <motion.polygon key={l} points={Array.from({ length: n }, (_, i) => gridPt(i, R * l)).join(' ')}
          fill="none" stroke={colors.bgCardBorder} strokeWidth={0.5} />
      ))}
      {axes.map((_, i) => <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle(i)) * R} y2={cy + Math.sin(angle(i)) * R} stroke={colors.bgCardBorder} strokeWidth={0.5} />)}
      <motion.polygon points={dataPts} fill={colors.cyan + '20'} stroke={colors.cyan} strokeWidth={1.5}
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {axes.map((a, i) => <text key={i} x={cx + Math.cos(angle(i)) * (R + 14)} y={cy + Math.sin(angle(i)) * (R + 14)} textAnchor="middle" fontSize={8} fill={colors.textMuted} fontFamily={typography.mono}>{a}</text>)}
    </svg>
  );
}

// ── Historical Trends ──
function HistoricalTrends() {
  const { months, series } = historicalTrendsData;
  const W = 320, H = 160, pad = 30;
  const allV = series.flatMap(s => s.points);
  const minV = Math.min(...allV), maxV = Math.max(...allV);
  const range = maxV - minV || 1;
  const px = (i: number) => pad + i * ((W - pad * 2) / (months.length - 1));
  const py = (v: number) => pad + (1 - (v - minV) / range) * (H - pad * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        {series.map((s, si) => (
          <linearGradient key={si} id={`trend${si}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.15} /><stop offset="100%" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {series.map((s, si) => {
        const pts = s.points.map((v, i) => ({ x: px(i), y: py(v) }));
        const d = smoothPath(pts);
        const area = d + ` L${pts[pts.length - 1].x},${H - pad} L${pts[0].x},${H - pad} Z`;
        return (
          <g key={si}>
            <motion.path d={area} fill={`url(#trend${si})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: si * 0.1 }} />
            <motion.path d={d} fill="none" stroke={s.color} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: si * 0.1 }} />
          </g>
        );
      })}
      {months.map((m, i) => i % 3 === 0 && <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize={7} fill={colors.textMuted} fontFamily={typography.mono}>{m}</text>)}
      {/* legend */}
      {series.map((s, i) => (
        <g key={i}>
          <line x1={pad + i * 75} y1={8} x2={pad + i * 75 + 12} y2={8} stroke={s.color} strokeWidth={2} />
          <text x={pad + i * 75 + 16} y={11} fontSize={7} fill={colors.textSecondary} fontFamily={typography.mono}>{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Debt/Equity Readout ──
function DebtEquityReadout() {
  const { ratio } = debtEquity;
  return (
    <GlassCard style={{ padding: '14px 16px', marginTop: 10 }}>
      <div style={{ fontFamily: typography.mono, fontSize: 9, color: colors.textMuted, letterSpacing: 1, marginBottom: 6 }}>DEBT / EQUITY</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <motion.span style={{ fontFamily: typography.heading, fontSize: 32, fontWeight: 700, color: colors.amber }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          {ratio.toFixed(2)}
        </motion.span>
        <span style={{ fontFamily: typography.mono, fontSize: 11, color: colors.textSecondary }}>x</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: colors.bgCardBorder, marginTop: 8 }}>
        <motion.div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${colors.neonGreen}, ${colors.amber})` }}
          initial={{ width: 0 }} animate={{ width: `${Math.min(ratio * 50, 100)}%` }} transition={{ duration: 1 }} />
      </div>
    </GlassCard>
  );
}

// ── Main Dashboard ──
export default function V2ClassicDashboard() {
  const { isMobile, isTablet } = useResponsive();
  const col = isMobile ? '1fr' : isTablet ? '1fr 1fr' : undefined;

  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById('root')].filter(Boolean) as HTMLElement[];
    els.forEach(el => el.classList.add('scrollable'));
    return () => { els.forEach(el => el.classList.remove('scrollable')); };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: colors.bgPrimary, color: colors.textPrimary, fontFamily: typography.body, paddingBottom: 80 }}>
      <GridFloor />
      <AmbientParticles />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <Header />
        <KPIStrip isMobile={isMobile} />

        {/* P&L Performance */}
        <section style={S.section}>
          <div style={S.title}>P&L Performance</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '7fr 3fr', gap: 14 }}>
            <GlassCard><WaterfallChart /></GlassCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <GlassCard style={{ flex: 1 }}><ProfitabilityChart /></GlassCard>
              <DebtEquityReadout />
            </div>
          </div>
        </section>

        {/* Balance Sheet & Assets */}
        <section style={S.section}>
          <div style={S.title}>Balance Sheet &amp; Assets</div>
          <div style={{ display: 'grid', gridTemplateColumns: col ?? '1fr 1fr', gap: 14 }}>
            <GlassCard style={{ overflow: 'auto' }}><DataTable rows={balanceSheetTableData} /></GlassCard>
            <GlassCard><AssetDonut /></GlassCard>
          </div>
        </section>

        {/* Cash & Liquidity */}
        <section style={S.section}>
          <div style={S.title}>Cash &amp; Liquidity</div>
          <div style={{ display: 'grid', gridTemplateColumns: col ?? '1fr 1fr', gap: 14 }}>
            <GlassCard style={{ overflow: 'auto' }}><DataTable rows={cashLiquidityTableData} /></GlassCard>
            <GlassCard><CashPositionLineChart /></GlassCard>
          </div>
        </section>

        {/* Trends & Compliance */}
        <section style={S.section}>
          <div style={S.title}>Trends &amp; Compliance</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 14 }}>
            <GlassCard>
              <div style={{ fontFamily: typography.mono, fontSize: 9, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 }}>COMPLIANCE SCORE</div>
              <ComplianceDonut />
            </GlassCard>
            <GlassCard>
              <div style={{ fontFamily: typography.mono, fontSize: 9, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 }}>VARIANCE RADAR</div>
              <VarianceRadar />
            </GlassCard>
            <GlassCard>
              <div style={{ fontFamily: typography.mono, fontSize: 9, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 }}>HISTORICAL TRENDS</div>
              <HistoricalTrends />
            </GlassCard>
          </div>
        </section>
      </div>
    </div>
  );
}
