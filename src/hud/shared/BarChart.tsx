import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';

interface Bar {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  bars: Bar[];
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

const BAR_WIDTH = 36;
const GAP = 20;
const VALUE_HEIGHT = 18;

const BarChart: React.FC<BarChartProps> = ({ bars, height = 150 }) => {
  const id = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  const chartHeight = height;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Chart area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: GAP,
          height: chartHeight + VALUE_HEIGHT,
          position: 'relative',
        }}
      >
        {bars.map((bar, i) => {
          const barH = (bar.value / maxValue) * chartHeight;
          const isHovered = hoveredIndex === i;
          const gradientId = `bar-grad-${id}-${i}`;
          const glowAlpha = isHovered ? 0.5 : 0.3;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: BAR_WIDTH,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Value label above bar */}
              <motion.span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9,
                  fontWeight: 600,
                  color: bar.color,
                  marginBottom: 4,
                  whiteSpace: 'nowrap',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.5 }}
              >
                {bar.value}
              </motion.span>

              {/* Bar */}
              <svg
                width={BAR_WIDTH}
                height={chartHeight}
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={bar.color} stopOpacity={1} />
                    <stop
                      offset="100%"
                      stopColor={bar.color}
                      stopOpacity={0.3}
                    />
                  </linearGradient>
                </defs>

                <motion.rect
                  x={0}
                  width={BAR_WIDTH}
                  rx={4}
                  ry={4}
                  fill={`url(#${gradientId})`}
                  initial={{ y: chartHeight, height: 0 }}
                  animate={{
                    y: chartHeight - barH,
                    height: barH,
                    scaleY: isHovered ? 1.05 : 1,
                  }}
                  transition={{
                    y: {
                      delay: i * 0.1,
                      type: 'spring',
                      stiffness: 120,
                      damping: 14,
                    },
                    height: {
                      delay: i * 0.1,
                      type: 'spring',
                      stiffness: 120,
                      damping: 14,
                    },
                    scaleY: { duration: 0.2 },
                  }}
                  style={{
                    transformOrigin: `${BAR_WIDTH / 2}px ${chartHeight}px`,
                    filter: `drop-shadow(0 0 6px ${hexToRgba(bar.color, glowAlpha)})`,
                    cursor: 'pointer',
                  }}
                />
              </svg>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div
        style={{
          display: 'flex',
          gap: GAP,
          marginTop: 6,
        }}
      >
        {bars.map((bar, i) => (
          <span
            key={i}
            style={{
              width: BAR_WIDTH,
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              color: '#8A8F98',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
