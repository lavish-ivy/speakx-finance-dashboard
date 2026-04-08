import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMaskedValue } from '../context/DashboardContext';

interface DataTableProps {
  headers: string[];
  rows: DataRow[];
  formatValue?: (val: number) => string;
}

export interface DataRow {
  label: string;
  values: number[];
  ytd?: number;
  bold?: boolean;
  indent?: boolean;
  highlight?: boolean;
  pctRow?: boolean;
  children?: DataRow[];
}

function ToggleButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'Orbitron', monospace",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: visible ? '#00FFCC' : 'rgba(255,255,255,0.45)',
        background: visible ? 'rgba(0,255,204,0.08)' : 'rgba(255,255,255,0.04)',
        border: visible ? '1px solid rgba(0,255,204,0.2)' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        padding: '6px 12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: 10,
      }}
    >
      <span style={{ fontSize: 12 }}>{visible ? '⊟' : '⊞'}</span>
      {visible ? 'HIDE TABLE' : 'DATA GRID'}
    </button>
  );
}

function ExpandArrow({ expanded }: { expanded: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 8,
      marginRight: 4,
      transition: 'transform 0.2s ease',
      transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
      color: '#00FFCC',
      cursor: 'pointer',
    }}>
      ▶
    </span>
  );
}

function TableRow({
  row,
  formatValue,
  mask,
  depth = 0,
}: {
  row: DataRow;
  formatValue: (val: number) => string;
  mask: (v: string) => string;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = row.children && row.children.length > 0;

  const rowStyle: React.CSSProperties = {
    borderBottom: row.bold ? '1px solid var(--divider)' : 'none',
    background: row.highlight
      ? 'rgba(0,255,204,0.04)'
      : 'transparent',
    cursor: hasChildren ? 'pointer' : 'default',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10,
    color: row.highlight
      ? '#00FFCC'
      : row.bold
        ? 'var(--text-primary)'
        : row.pctRow
          ? 'rgba(255,255,255,0.35)'
          : 'rgba(255,255,255,0.65)',
    fontWeight: row.bold ? 700 : 400,
    fontStyle: row.pctRow ? 'italic' : 'normal',
    padding: '4px 6px',
    paddingLeft: row.indent ? 20 + depth * 12 : 6,
    whiteSpace: 'nowrap',
    position: 'sticky' as const,
    left: 0,
    background: 'var(--bg-card)',
    zIndex: 1,
    minWidth: 140,
  };

  const cellStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    textAlign: 'right',
    padding: '4px 6px',
    whiteSpace: 'nowrap',
    fontWeight: row.bold ? 700 : 400,
    fontStyle: row.pctRow ? 'italic' : 'normal',
  };

  const getCellColor = (val: number) => {
    if (row.pctRow) return 'rgba(255,255,255,0.35)';
    if (row.highlight) return val < 0 ? '#FF453A' : '#00FFCC';
    if (val < 0) return '#FF453A';
    return row.bold ? 'var(--text-primary)' : 'rgba(255,255,255,0.65)';
  };

  const fmtVal = (val: number) => {
    if (row.pctRow) return mask(`${val.toFixed(1)}%`);
    return mask(formatValue(val));
  };

  return (
    <>
      <tr
        style={rowStyle}
        onClick={hasChildren ? () => setExpanded(!expanded) : undefined}
      >
        <td style={labelStyle}>
          {hasChildren && <ExpandArrow expanded={expanded} />}
          {row.label}
        </td>
        {row.values.map((v, i) => (
          <td key={i} style={{ ...cellStyle, color: getCellColor(v) }}>
            {fmtVal(v)}
          </td>
        ))}
        {row.ytd !== undefined && (
          <td style={{
            ...cellStyle,
            color: getCellColor(row.ytd),
            fontWeight: 700,
            borderLeft: '1px solid var(--divider)',
            background: 'rgba(0,255,204,0.02)',
          }}>
            {fmtVal(row.ytd)}
          </td>
        )}
      </tr>
      <AnimatePresence>
        {expanded && row.children?.map((child) => (
          <motion.tr
            key={child.label}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td style={{ ...labelStyle, paddingLeft: 24 + depth * 12, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              {child.label}
            </td>
            {child.values.map((v, i) => (
              <td key={i} style={{ ...cellStyle, color: v < 0 ? '#FF453A' : 'rgba(255,255,255,0.5)' }}>
                {fmtVal(v)}
              </td>
            ))}
            {child.ytd !== undefined && (
              <td style={{
                ...cellStyle,
                color: child.ytd < 0 ? '#FF453A' : 'rgba(255,255,255,0.5)',
                borderLeft: '1px solid var(--divider)',
                background: 'rgba(0,255,204,0.02)',
              }}>
                {fmtVal(child.ytd)}
              </td>
            )}
          </motion.tr>
        ))}
      </AnimatePresence>
    </>
  );
}

export default function DataTable({ headers, rows, formatValue = (v) => v.toFixed(2) }: DataTableProps) {
  const [visible, setVisible] = useState(false);
  const mask = useMaskedValue();

  return (
    <div>
      <ToggleButton visible={visible} onToggle={() => setVisible(!visible)} />
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 10,
              padding: 0,
              overflow: 'auto',
              maxHeight: 500,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 600,
              }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, zIndex: 2, background: 'rgba(10,12,18,0.95)' }}>
                    {headers.map((h, i) => (
                      <th key={h} style={{
                        fontFamily: "'Orbitron', monospace",
                        fontSize: 8,
                        fontWeight: 700,
                        color: i === headers.length - 1 ? '#00FFCC' : 'var(--text-muted)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '8px 6px',
                        textAlign: i === 0 ? 'left' : 'right',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid var(--divider)',
                        position: i === 0 ? 'sticky' : undefined,
                        left: i === 0 ? 0 : undefined,
                        background: i === 0 ? 'rgba(10,12,18,0.95)' : undefined,
                        ...(i === headers.length - 1 ? { borderLeft: '1px solid var(--divider)', background: 'rgba(0,255,204,0.02)' } : {}),
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.label}
                      row={row}
                      formatValue={formatValue}
                      mask={mask}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
