import React, { useId, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Series {
  name: string;
  color: string;
  data: number[];
}

interface MultiLineChartProps {
  months: string[];
  series: Series[];
  width?: number;
  height?: number;
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const PADDING = { top: 30, right: 20, bottom: 30, left: 40 };
const LEGEND_HEIGHT = 20;

/**
 * Compute cubic bezier control points for smooth curve through data points.
 * Uses Catmull-Rom to Bezier conversion for natural-looking curves.
 */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const tension = 0.3;
    const cp1x = p1.x + ((p2.x - p0.x) * tension);
    const cp1y = p1.y + ((p2.y - p0.y) * tension);
    const cp2x = p2.x - ((p3.x - p1.x) * tension);
    const cp2y = p2.y - ((p3.y - p1.y) * tension);

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

/** Build area path: line path + close along bottom edge. */
function areaPath(
  points: { x: number; y: number }[],
  bottomY: number
): string {
  const line = smoothPath(points);
  if (!line) return '';
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;
}

const MultiLineChart: React.FC<MultiLineChartProps> = ({
  months,
  series,
  width = 500,
  height = 260,
}) => {
  const id = useId();
  const [hovered, setHovered] = useState<{
    seriesIdx: number;
    pointIdx: number;
  } | null>(null);

  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom - LEGEND_HEIGHT;

  // Compute global min/max for y-axis (percentage scale, 10% intervals)
  const { yMin, yMax, yTicks } = useMemo(() => {
    const allValues = series.flatMap((s) => s.data);
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const min = Math.floor(rawMin / 10) * 10;
    const max = Math.ceil(rawMax / 10) * 10;
    const ticks: number[] = [];
    for (let v = min; v <= max; v += 10) {
      ticks.push(v);
    }
    return { yMin: min, yMax: max, yTicks: ticks };
  }, [series]);

  const yRange = yMax - yMin || 1;

  // Map data to pixel coordinates
  const seriesPoints = useMemo(() => {
    return series.map((s) =>
      s.data.map((v, i) => ({
        x: PADDING.left + (i / Math.max(months.length - 1, 1)) * chartW,
        y:
          PADDING.top +
          LEGEND_HEIGHT +
          chartH -
          ((v - yMin) / yRange) * chartH,
      }))
    );
  }, [series, months.length, chartW, chartH, yMin, yRange]);

  const bottomY = PADDING.top + LEGEND_HEIGHT + chartH;

  const handlePointEnter = useCallback(
    (seriesIdx: number, pointIdx: number) => {
      setHovered({ seriesIdx, pointIdx });
    },
    []
  );
  const handlePointLeave = useCallback(() => setHovered(null), []);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* Gradient defs for area fills */}
      <defs>
        {series.map((s, si) => {
          const gradId = `area-grad-${id}-${si}`;
          return (
            <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.08} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          );
        })}
      </defs>

      {/* Legend (top-right) */}
      <g>
        {series.map((s, si) => {
          const legendX = width - PADDING.right - (series.length - si) * 100;
          return (
            <g key={si}>
              <circle cx={legendX} cy={12} r={4} fill={s.color} />
              <text
                x={legendX + 10}
                y={12}
                dominantBaseline="central"
                fill="#8A8F98"
                fontSize={8}
                fontFamily="'Inter', sans-serif"
              >
                {s.name}
              </text>
            </g>
          );
        })}
      </g>

      {/* Horizontal gridlines */}
      {yTicks.map((tick) => {
        const y =
          PADDING.top +
          LEGEND_HEIGHT +
          chartH -
          ((tick - yMin) / yRange) * chartH;
        return (
          <g key={tick}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={PADDING.left + chartW}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
            <text
              x={PADDING.left - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              fill="#8A8F98"
              fontSize={8}
              fontFamily="'JetBrains Mono', monospace"
            >
              {tick}%
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {months.map((m, i) => {
        const x = PADDING.left + (i / Math.max(months.length - 1, 1)) * chartW;
        return (
          <text
            key={i}
            x={x}
            y={bottomY + 16}
            textAnchor="middle"
            fill="#8A8F98"
            fontSize={8}
            fontFamily="'JetBrains Mono', monospace"
          >
            {m}
          </text>
        );
      })}

      {/* Area fills */}
      {series.map((_s, si) => {
        const pts = seriesPoints[si];
        const gradId = `area-grad-${id}-${si}`;
        return (
          <motion.path
            key={`area-${si}`}
            d={areaPath(pts, bottomY)}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        );
      })}

      {/* Lines */}
      {series.map((s, si) => {
        const pts = seriesPoints[si];
        const pathD = smoothPath(pts);
        // Approximate path length
        let pathLen = 0;
        for (let i = 1; i < pts.length; i++) {
          const dx = pts[i].x - pts[i - 1].x;
          const dy = pts[i].y - pts[i - 1].y;
          pathLen += Math.sqrt(dx * dx + dy * dy);
        }
        return (
          <motion.path
            key={`line-${si}`}
            d={pathD}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{
              strokeDasharray: pathLen,
              strokeDashoffset: pathLen,
            }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        );
      })}

      {/* Data points */}
      {series.map((s, si) =>
        seriesPoints[si].map((pt, pi) => {
          const isActive =
            hovered?.seriesIdx === si && hovered?.pointIdx === pi;
          return (
            <motion.circle
              key={`pt-${si}-${pi}`}
              cx={pt.x}
              cy={pt.y}
              r={3}
              fill={s.color}
              stroke="#050B14"
              strokeWidth={2}
              style={{
                filter: `drop-shadow(0 0 4px ${hexToRgba(s.color, 0.4)})`,
                cursor: 'pointer',
              }}
              animate={{ scale: isActive ? 1.5 : 1 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={() => handlePointEnter(si, pi)}
              onMouseLeave={handlePointLeave}
            />
          );
        })
      )}

      {/* Crosshair + tooltip on hover */}
      {hovered && (() => {
        const pt = seriesPoints[hovered.seriesIdx][hovered.pointIdx];
        const s = series[hovered.seriesIdx];
        const value = s.data[hovered.pointIdx];
        const month = months[hovered.pointIdx];
        return (
          <g>
            {/* Vertical crosshair */}
            <line
              x1={pt.x}
              y1={PADDING.top + LEGEND_HEIGHT}
              x2={pt.x}
              y2={bottomY}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="3 3"
            />
            {/* Horizontal crosshair */}
            <line
              x1={PADDING.left}
              y1={pt.y}
              x2={PADDING.left + chartW}
              y2={pt.y}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="3 3"
            />
            {/* Tooltip background */}
            <rect
              x={pt.x + 8}
              y={pt.y - 26}
              width={70}
              height={22}
              rx={4}
              fill="rgba(10, 16, 30, 0.90)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
            {/* Tooltip text */}
            <text
              x={pt.x + 14}
              y={pt.y - 12}
              fill="#FFFFFF"
              fontSize={9}
              fontFamily="'Inter', sans-serif"
              fontWeight={600}
            >
              {value}% - {month}
            </text>
          </g>
        );
      })()}
    </svg>
  );
};

export default MultiLineChart;
