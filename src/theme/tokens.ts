/**
 * Editorial CFO palette — "SpeakX Annual Review"
 * -------------------------------------------------
 * Reference idiom: FT, Bridgewater Daily Observations, The Economist.
 *
 * Light mode ("Paper") — warm cream page, deep slate ink, burgundy accent.
 * Dark mode ("Dusk")   — warm near-black, cream ink, terracotta accent.
 *
 * Both modes are editorial, not "dashboard dark". No neon, no glow, hairline
 * rules instead of glass cards.
 *
 * The `colorMap` is now bi-directional: panels still author with the legacy
 * logical keys ('#00FFCC', '#FFD700', etc.) as semantic color slots, and the
 * map routes each slot to its mode-appropriate editorial hue. This avoids
 * touching every panel's inline color literals.
 */

export interface ThemeTokens {
  bgDeep: string;
  bgMid: string;
  bgCard: string;
  borderCard: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentCyan: string;
  accentGold: string;
  accentPurple: string;
  accentCoral: string;
  accentOrange: string;
  accentBlue: string;
  glowCyan: string;
  hoverGlow: string;
  hoverBorder: string;
  chartGridline: string;
  tooltipBg: string;
  divider: string;
  selectionBg: string;
}

/* ── Light mode: "Paper" ─────────────────────────────────── */
export const lightTokens: ThemeTokens = {
  bgDeep: '#FBF8F3',          // warm cream page
  bgMid: '#F3EDE2',           // slightly darker cream (section bands)
  bgCard: 'transparent',      // no glass cards — content sits on the page
  borderCard: 'rgba(26, 29, 35, 0.15)',    // hairline slate rule
  borderSubtle: 'rgba(26, 29, 35, 0.08)',  // lighter hairline
  textPrimary: '#1A1D23',     // deep slate ink
  textSecondary: '#4A4E58',   // mid slate
  textMuted: '#8B8680',       // warm grey
  accentCyan: '#2C4F3E',      // forest green (primary data)
  accentGold: '#8B6F30',      // warm ochre
  accentPurple: '#3E3A5F',    // deep indigo
  accentCoral: '#7A1E2B',     // burgundy (the single editorial accent)
  accentOrange: '#A35B35',    // warm clay
  accentBlue: '#3E5570',      // slate steel
  glowCyan: 'rgba(122, 30, 43, 0.04)',     // almost nothing
  hoverGlow: '0 1px 0 rgba(26, 29, 35, 0.12)', // hairline lift, not a glow
  hoverBorder: 'rgba(26, 29, 35, 0.28)',
  chartGridline: 'rgba(26, 29, 35, 0.08)',
  tooltipBg: 'rgba(251, 248, 243, 0.98)',
  divider: 'rgba(26, 29, 35, 0.10)',
  selectionBg: 'rgba(122, 30, 43, 0.18)',  // burgundy highlight
};

/* ── Dark mode: "Dusk" ───────────────────────────────────── */
export const darkTokens: ThemeTokens = {
  bgDeep: '#1A1814',          // warm near-black (paper burned down)
  bgMid: '#242018',
  bgCard: 'transparent',
  borderCard: 'rgba(245, 239, 228, 0.15)',
  borderSubtle: 'rgba(245, 239, 228, 0.08)',
  textPrimary: '#F5EFE4',     // cream ink
  textSecondary: '#B8B0A0',
  textMuted: '#6B645A',
  accentCyan: '#7FA68A',      // muted sage
  accentGold: '#C4A770',      // soft ochre
  accentPurple: '#8B92B8',    // soft indigo
  accentCoral: '#C97B6A',     // terracotta (burgundy at dusk)
  accentOrange: '#D9A574',
  accentBlue: '#8C9BB0',
  glowCyan: 'rgba(127, 166, 138, 0.06)',
  hoverGlow: '0 1px 0 rgba(245, 239, 228, 0.20)',
  hoverBorder: 'rgba(245, 239, 228, 0.30)',
  chartGridline: 'rgba(245, 239, 228, 0.08)',
  tooltipBg: 'rgba(26, 24, 20, 0.96)',
  divider: 'rgba(245, 239, 228, 0.12)',
  selectionBg: 'rgba(201, 123, 106, 0.30)',
};

/* ── Bi-directional color slot routing ───────────────────
 * Panels author colors using the legacy hex literals as stable semantic
 * slots. `mapColor` now remaps in BOTH modes, producing the editorial hue
 * for whichever mode is active.
 *
 * Slot meanings:
 *   #00FFCC → primary positive / revenue / "green ink"
 *   #FFD700 → warning-ish / highlight / ochre
 *   #BF5AF2 → tertiary data series / indigo
 *   #FF453A → negative / loss / burgundy (THE accent)
 *   #FF9F0A → secondary expense series / clay
 *   #64D2FF → neutral support / slate steel
 *   #FFFFFF → primary ink (auto-remaps per mode)
 *   #8A8F98 → muted text (auto-remaps per mode)
 */
export const darkMap: Record<string, string> = {
  '#00FFCC': darkTokens.accentCyan,
  '#FFD700': darkTokens.accentGold,
  '#BF5AF2': darkTokens.accentPurple,
  '#FF453A': darkTokens.accentCoral,
  '#FF9F0A': darkTokens.accentOrange,
  '#64D2FF': darkTokens.accentBlue,
  '#FFFFFF': darkTokens.textPrimary,
  '#8A8F98': darkTokens.textMuted,
};

export const lightMap: Record<string, string> = {
  '#00FFCC': lightTokens.accentCyan,
  '#FFD700': lightTokens.accentGold,
  '#BF5AF2': lightTokens.accentPurple,
  '#FF453A': lightTokens.accentCoral,
  '#FF9F0A': lightTokens.accentOrange,
  '#64D2FF': lightTokens.accentBlue,
  '#FFFFFF': lightTokens.textPrimary,
  '#8A8F98': lightTokens.textMuted,
};

/** @deprecated retained for compat — use `lightMap` / `darkMap` instead. */
export const colorMap = lightMap;
