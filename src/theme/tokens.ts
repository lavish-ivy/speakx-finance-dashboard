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

export const darkTokens: ThemeTokens = {
  bgDeep: '#050B14',
  bgMid: '#0A101E',
  bgCard: 'rgba(10, 16, 30, 0.70)',
  borderCard: 'rgba(255, 255, 255, 0.15)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B7C3',
  textMuted: '#8A8F98',
  accentCyan: '#00FFCC',
  accentGold: '#FFD700',
  accentPurple: '#BF5AF2',
  accentCoral: '#FF453A',
  accentOrange: '#FF9F0A',
  accentBlue: '#64D2FF',
  glowCyan: 'rgba(0,255,204,0.12)',
  hoverGlow: '0 0 25px rgba(0,255,204,0.12), inset 0 0 25px rgba(0,255,204,0.04)',
  hoverBorder: 'rgba(0,255,204,0.30)',
  chartGridline: 'rgba(255,255,255,0.05)',
  tooltipBg: 'rgba(10,16,30,0.9)',
  divider: 'rgba(255,255,255,0.08)',
  selectionBg: 'rgba(0, 255, 204, 0.3)',
};

export const lightTokens: ThemeTokens = {
  bgDeep: '#FFFFFF',
  bgMid: '#F8F9FC',
  bgCard: 'rgba(255, 255, 255, 0.90)',
  borderCard: 'rgba(0, 0, 0, 0.10)',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  textPrimary: '#1A1A2E',
  textSecondary: '#4A5568',
  textMuted: '#6B7280',
  accentCyan: '#00897B',
  accentGold: '#B8860B',
  accentPurple: '#8E24AA',
  accentCoral: '#C62828',
  accentOrange: '#E65100',
  accentBlue: '#0277BD',
  glowCyan: 'rgba(0,137,123,0.10)',
  hoverGlow: '0 0 20px rgba(0,137,123,0.10), inset 0 0 20px rgba(0,137,123,0.03)',
  hoverBorder: 'rgba(0,137,123,0.25)',
  chartGridline: 'rgba(0,0,0,0.06)',
  tooltipBg: 'rgba(255,255,255,0.95)',
  divider: 'rgba(0,0,0,0.08)',
  selectionBg: 'rgba(0, 137, 123, 0.2)',
};

// Map dark-mode accent colors to light-mode equivalents
export const colorMap: Record<string, string> = {
  '#00FFCC': lightTokens.accentCyan,
  '#FFD700': lightTokens.accentGold,
  '#BF5AF2': lightTokens.accentPurple,
  '#FF453A': lightTokens.accentCoral,
  '#FF9F0A': lightTokens.accentOrange,
  '#64D2FF': lightTokens.accentBlue,
  '#FFFFFF': lightTokens.textPrimary,
  '#8A8F98': lightTokens.textMuted,
};
