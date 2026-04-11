import { FONTS } from '../../theme/typography';

/**
 * Editorial methodology footnote — the thin small-caps strip that sits at
 * the bottom of a panel and tells a CFO's board member "here's how this
 * number was computed and here's the caveat you're about to ask about".
 *
 * Credibility lives in footnotes. A panel without methodology is a chart;
 * a panel with methodology is an artefact. This component exists to make
 * adding that strip a two-line import instead of 15 lines of inline CSS
 * repeated across every panel.
 *
 * Usage: place as the last child inside a `panelFrame` flex column. It's
 * `flexShrink: 0` so it never fights the chart for space.
 */
interface PanelFootnoteProps {
  /** Methodology / reconciliation / caveat lines — joined by dot separators. */
  notes: string[];
}

export default function PanelFootnote({ notes }: PanelFootnoteProps) {
  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: '1px dashed var(--border-subtle)',
        fontFamily: FONTS.caption.family,
        fontSize: 9,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2px 10px',
        flexShrink: 0,
      }}
    >
      {notes.map((note, i) => (
        <span key={i} style={{ display: 'inline-flex', gap: 10 }}>
          {i > 0 && <span aria-hidden>·</span>}
          <span>{note}</span>
        </span>
      ))}
    </div>
  );
}
