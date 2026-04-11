/**
 * Editorial CFO typography — "SpeakX Annual Review"
 *
 * - `serif`  → Fraunces display: masthead, hero headlines, section titles.
 * - `sans`   → Inter with tabular numerals: body copy and secondary labels.
 * - `data`   → Inter tabular-lining: all financial numbers. Tabular-nums
 *              is critical — column alignment is non-negotiable for a CFO
 *              artefact, and Inter's `"tnum"` feature handles it cleanly.
 * - `caption`→ small-caps editorial captions ("Treasury concentration",
 *              "Booked pre-tax result"). Replaces the Roboto Mono shouty
 *              labels from the gamer-HUD era.
 *
 * SIZES abandon the 8–11px chartjunk sizes. Financial tables can live
 * around 12–13px; hero statements are 40–72px display. Legibility over
 * density. This is a presentation artefact, not a trading terminal.
 *
 * Fraunces is loaded via @fontsource in `src/App.tsx`.
 */

export const FONTS = {
  /** Editorial serif — masthead, hero, section titles. Use sparingly. */
  serif: {
    family: "'Fraunces', 'Times New Roman', Georgia, serif",
    weight: 500,
    letterSpacing: '-0.01em',
  },
  /** Hero number display — larger serif, heavier weight. */
  display: {
    family: "'Fraunces', 'Times New Roman', Georgia, serif",
    weight: 600,
    letterSpacing: '-0.02em',
  },
  /** Body sans for copy, legends, axis labels. */
  sans: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    weight: 400,
    letterSpacing: '0',
  },
  /** All financial numbers. Tabular-nums enforced via CSS (see index.css). */
  data: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    weight: 500,
    letterSpacing: '-0.005em',
  },
  /** Editorial small-caps caption ("Treasury concentration"). */
  caption: {
    family: "'Inter', sans-serif",
    weight: 500,
    transform: 'uppercase' as const,
    letterSpacing: '0.14em',
  },

  /* ── Legacy aliases (keep panels compiling while we restyle) ── */
  /** @deprecated use `serif` or `caption` */
  header: {
    family: "'Fraunces', 'Times New Roman', Georgia, serif",
    weight: 500,
    transform: 'none' as const,
    letterSpacing: '-0.01em',
  },
  /** @deprecated use `caption` */
  label: {
    family: "'Inter', sans-serif",
    weight: 500,
    transform: 'uppercase' as const,
    letterSpacing: '0.14em',
  },
  /** @deprecated use `sans` */
  body: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    weight: 400,
  },
};

export const SIZES = {
  /* Editorial hierarchy — generous, not cramped */
  masthead: '13px',          // SPEAKX · THE ANNUAL REVIEW wordmark
  heroNumber: '56px',        // lead KPI statement
  heroNumberSm: '34px',      // secondary hero
  sectionTitle: '22px',      // panel headline serif
  sectionTitleSm: '16px',    // mobile / compact panel headline
  captionSmall: '10px',      // small-caps labels

  /* Table / data */
  tableCell: '12px',
  tableHeader: '10px',
  kpiValue: '32px',          // large KPI currency value
  kpiValueSmall: '20px',     // compact variant
  kpiLabel: '10px',          // caption sitting above a KPI number
  subtext: '11px',
  chartLabel: '10px',

  /* Legacy aliases (preserved keys) */
  headerBar: '13px',
  panelTitle: '18px',        // was 11px — bumped to editorial scale
  statusDate: '11px',
};
