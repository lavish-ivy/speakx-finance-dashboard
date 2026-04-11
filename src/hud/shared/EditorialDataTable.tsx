import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONTS } from '../../theme/typography';
import { useMaskedValue } from '../../context/DashboardContext';

/**
 * Editorial data table — the hairline-styled replacement for `DataTable`.
 *
 * The legacy table was wearing gamer-HUD chrome: Orbitron uppercase headers,
 * JetBrains Mono numerics, #00FFCC highlight rows, rgba white body text,
 * and a "DATA GRID ⊞ / HIDE TABLE ⊟" toggle button sitting in a cyan glow
 * box. All of that fought the editorial direction.
 *
 * This version keeps the row model intact (so call sites only have to swap
 * the import) but delivers the numbers as a proper editorial table:
 *
 *   - Fraunces serif caption for the toggle affordance ("View line items")
 *   - Inter tabular-nums for every cell, right-aligned, with `-` for
 *     negatives instead of #FF453A text (credibility lives in restraint)
 *   - Hairline rules at every `bold` row — no glass-card wrapping, no
 *     backdrop blur, no borderRadius
 *   - Burgundy accent only on highlight totals (Total Assets, Net Cash
 *     Flow, etc.) — the same slot HeroStatement uses for Closing Liquidity
 *   - Section header rows render as small-caps dividers, matching the
 *     editorial rhythm of PanelFootnote and the panel captions
 *
 * The TableProps shape is intentionally identical to `DataTable` so the
 * three page rewrites (P&L, Cash, BS) can migrate with a single import
 * change and a single line for the default collapsed state.
 */

export interface EditorialDataRow {
  label: string;
  values: number[];
  ytd?: number;
  /** Renders as a bold row with a hairline rule below it. */
  bold?: boolean;
  /** Indents the label 16px (nested line item). */
  indent?: boolean;
  /** Burgundy accent + dotted top rule (final totals, reconciliation rows). */
  highlight?: boolean;
  /** Italic muted row — used for margin % lines that sit under a bold row. */
  pctRow?: boolean;
  /** Full-width small-caps divider; numeric cells are ignored. */
  section?: boolean;
  children?: EditorialDataRow[];
}

interface EditorialDataTableProps {
  headers: string[];
  rows: EditorialDataRow[];
  formatValue?: (val: number) => string;
  /** Default to `true` to show the table immediately (no toggle). */
  defaultOpen?: boolean;
  /** Override the toggle label — defaults to "View line items". */
  toggleLabel?: string;
}

function ExpandArrow({ expanded }: { expanded: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        fontSize: 9,
        marginRight: 6,
        transition: 'transform 0.2s ease',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
      }}
    >
      ▸
    </span>
  );
}

function Row({
  row,
  formatValue,
  mask,
  columnCount,
}: {
  row: EditorialDataRow;
  formatValue: (val: number) => string;
  mask: (v: string) => string;
  columnCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = !!row.children?.length;

  // Section divider — full-width small-caps, no numbers.
  if (row.section) {
    return (
      <tr>
        <td
          colSpan={columnCount}
          style={{
            fontFamily: FONTS.caption.family,
            fontSize: 9,
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '14px 6px 6px 6px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {row.label}
        </td>
      </tr>
    );
  }

  const rowBorderBottom = row.highlight
    ? '1px solid var(--accent-coral)'
    : row.bold
      ? '1px solid var(--border-card)'
      : '1px solid transparent';

  const labelColor = row.highlight
    ? 'var(--accent-coral)'
    : row.bold
      ? 'var(--text-primary)'
      : row.pctRow
        ? 'var(--text-muted)'
        : 'var(--text-secondary)';

  const labelStyle: React.CSSProperties = {
    fontFamily: FONTS.sans.family,
    fontSize: 12,
    color: labelColor,
    fontWeight: row.bold ? 600 : 400,
    fontStyle: row.pctRow ? 'italic' : 'normal',
    padding: '7px 6px',
    paddingLeft: row.indent ? 22 : 6,
    whiteSpace: 'nowrap',
    textAlign: 'left',
  };

  const cellStyle: React.CSSProperties = {
    fontFamily: FONTS.data.family,
    fontSize: 12,
    textAlign: 'right',
    padding: '7px 6px',
    whiteSpace: 'nowrap',
    fontWeight: row.bold ? 600 : 400,
    fontStyle: row.pctRow ? 'italic' : 'normal',
    fontVariantNumeric: 'tabular-nums lining-nums',
  };

  const cellColor = (val: number): string => {
    if (row.pctRow) return 'var(--text-muted)';
    if (row.highlight) return 'var(--accent-coral)';
    if (val < 0) return 'var(--accent-coral)';
    if (row.bold) return 'var(--text-primary)';
    return 'var(--text-secondary)';
  };

  const fmtVal = (val: number): string => {
    if (row.pctRow) return mask(`${val.toFixed(1)}%`);
    return mask(formatValue(val));
  };

  return (
    <>
      <tr
        onClick={hasChildren ? () => setExpanded(!expanded) : undefined}
        style={{
          borderBottom: rowBorderBottom,
          cursor: hasChildren ? 'pointer' : 'default',
        }}
      >
        <td style={labelStyle}>
          {hasChildren && <ExpandArrow expanded={expanded} />}
          {row.label}
        </td>
        {row.values.map((v, i) => (
          <td key={i} style={{ ...cellStyle, color: cellColor(v) }}>
            {fmtVal(v)}
          </td>
        ))}
        {row.ytd !== undefined && (
          <td
            style={{
              ...cellStyle,
              color: cellColor(row.ytd),
              fontWeight: 600,
              borderLeft: '1px solid var(--border-subtle)',
            }}
          >
            {fmtVal(row.ytd)}
          </td>
        )}
      </tr>
      <AnimatePresence>
        {expanded &&
          row.children?.map((child) => (
            <motion.tr
              key={child.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <td style={{ ...labelStyle, paddingLeft: 36, color: 'var(--text-muted)' }}>
                {child.label}
              </td>
              {child.values.map((v, i) => (
                <td
                  key={i}
                  style={{
                    ...cellStyle,
                    color: v < 0 ? 'var(--accent-coral)' : 'var(--text-muted)',
                  }}
                >
                  {fmtVal(v)}
                </td>
              ))}
              {child.ytd !== undefined && (
                <td
                  style={{
                    ...cellStyle,
                    color: child.ytd < 0 ? 'var(--accent-coral)' : 'var(--text-muted)',
                    borderLeft: '1px solid var(--border-subtle)',
                  }}
                >
                  {fmtVal(child.ytd)}
                </td>
              )}
            </motion.tr>
          ))}
      </AnimatePresence>
    </>
  );
}

export default function EditorialDataTable({
  headers,
  rows,
  formatValue = (v) => v.toFixed(2),
  defaultOpen = false,
  toggleLabel = 'View line items',
}: EditorialDataTableProps) {
  const [visible, setVisible] = useState(defaultOpen);
  const mask = useMaskedValue();

  return (
    <div>
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: FONTS.caption.family,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          background: 'transparent',
          border: 0,
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4px 0',
          cursor: 'pointer',
          marginBottom: visible ? 14 : 0,
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <span style={{ fontSize: 12 }} aria-hidden>
          {visible ? '−' : '+'}
        </span>
        {visible ? 'Hide line items' : toggleLabel}
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                overflowX: 'auto',
                maxHeight: 560,
                borderTop: '1px solid var(--text-primary)',
                borderBottom: '1px solid var(--text-primary)',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: 600,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-card)',
                    }}
                  >
                    {headers.map((h, i) => (
                      <th
                        key={h}
                        style={{
                          fontFamily: FONTS.caption.family,
                          fontSize: 9,
                          fontWeight: 500,
                          color: 'var(--text-muted)',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          padding: '10px 6px',
                          textAlign: i === 0 ? 'left' : 'right',
                          whiteSpace: 'nowrap',
                          borderLeft:
                            i === headers.length - 1
                              ? '1px solid var(--border-subtle)'
                              : undefined,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <Row
                      key={`${row.label}-${i}`}
                      row={row}
                      formatValue={formatValue}
                      mask={mask}
                      columnCount={headers.length}
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
